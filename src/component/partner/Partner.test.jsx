import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { animate } from 'motion'
import Partner from './Partner'
import PartnerAcknowledgement from './PartnerAcknowledgement'

const mockControls = {
    pause: jest.fn(),
    play: jest.fn(),
    stop: jest.fn(),
}

jest.mock('motion', () => ({
    animate: jest.fn(() => mockControls),
}))

const setReducedMotion = (matches) => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
        matches,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    }))
}

beforeEach(() => {
    jest.clearAllMocks()
    animate.mockImplementation(() => mockControls)
})

test('renders every existing collaborator once in the static acknowledgement', () => {
    render(<PartnerAcknowledgement />)

    expect(screen.getByText('In collaboration with')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(5)
    expect(screen.getByAltText('KfW')).toBeInTheDocument()
    expect(screen.getByAltText('GIZ')).toBeInTheDocument()
    expect(screen.getByAltText('GrEEn')).toBeInTheDocument()
    expect(screen.getByAltText('Modernizing Agriculture in Ghana')).toBeInTheDocument()
    expect(screen.getByAltText('UNCDF')).toBeInTheDocument()
})

test('renders one static accessible partner sequence for reduced motion', () => {
    setReducedMotion(true)
    render(<Partner />)

    expect(screen.getByRole('heading', { name: 'Development Partners' })).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(5)
    expect(screen.getByAltText('KfW')).toBeInTheDocument()
    expect(screen.getByAltText('GIZ')).toBeInTheDocument()
    expect(screen.getByAltText('GrEEn')).toBeInTheDocument()
    expect(screen.getByAltText('Modernizing Agriculture in Ghana')).toBeInTheDocument()
    expect(screen.getByAltText('UNCDF')).toBeInTheDocument()
    expect(screen.getAllByRole('list')).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'Development partner logos' })).toHaveClass('is-static')
})

test('runs one seamless sequence and pauses on hover or focus', async () => {
    setReducedMotion(false)
    const boundsSpy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function getBounds() {
        return {
            width: this.classList.contains('partners-rail__sequence') ? 1350 : 0,
            height: 100,
            top: 0,
            right: 0,
            bottom: 100,
            left: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }
    })

    render(<Partner />)
    const rail = screen.getByRole('region', { name: 'Development partner logos' })

    await waitFor(() => expect(animate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        { x: [0, -1350] },
        { duration: 30, ease: 'linear', repeat: Infinity },
    ))

    expect(animate.mock.results[0].value).toBe(mockControls)
    expect(screen.getAllByRole('img')).toHaveLength(5)

    fireEvent.mouseOver(rail)
    await waitFor(() => expect(mockControls.pause).toHaveBeenCalledTimes(1))
    fireEvent.mouseOut(rail)
    await waitFor(() => expect(mockControls.play).toHaveBeenCalledTimes(1))

    fireEvent.focus(rail)
    expect(mockControls.pause).toHaveBeenCalledTimes(2)
    fireEvent.blur(rail, { relatedTarget: document.body })
    expect(mockControls.play).toHaveBeenCalledTimes(2)

    boundsSpy.mockRestore()
})
