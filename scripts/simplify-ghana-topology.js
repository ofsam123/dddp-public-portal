const fs = require('fs')
const path = require('path')

const inputPath = path.resolve(__dirname, '..', 'public', 'data', 'ghana-regions.topo.json')
const tolerance = 25

const simplify = (points) => {
    if (points.length <= 2) return points

    const keep = new Uint8Array(points.length)
    const stack = [[0, points.length - 1]]
    const toleranceSquared = tolerance * tolerance
    keep[0] = 1
    keep[points.length - 1] = 1

    while (stack.length > 0) {
        const [start, end] = stack.pop()
        const first = points[start]
        const last = points[end]
        const dx = last[0] - first[0]
        const dy = last[1] - first[1]
        const lengthSquared = (dx * dx) + (dy * dy)
        let furthestIndex = -1
        let furthestDistance = toleranceSquared

        for (let index = start + 1; index < end; index += 1) {
            const point = points[index]
            let distance

            if (lengthSquared === 0) {
                const x = point[0] - first[0]
                const y = point[1] - first[1]
                distance = (x * x) + (y * y)
            } else {
                const projection = Math.max(0, Math.min(1, (
                    ((point[0] - first[0]) * dx) + ((point[1] - first[1]) * dy)
                ) / lengthSquared))
                const x = point[0] - (first[0] + (projection * dx))
                const y = point[1] - (first[1] + (projection * dy))
                distance = (x * x) + (y * y)
            }

            if (distance > furthestDistance) {
                furthestDistance = distance
                furthestIndex = index
            }
        }

        if (furthestIndex > 0) {
            keep[furthestIndex] = 1
            stack.push([start, furthestIndex], [furthestIndex, end])
        }
    }

    return points.filter((point, index) => keep[index])
}

const topology = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
topology.arcs = topology.arcs.map((arc) => {
    let x = 0
    let y = 0
    const absolutePoints = arc.map(([deltaX, deltaY]) => {
        x += deltaX
        y += deltaY
        return [x, y]
    })
    const simplified = simplify(absolutePoints)
    let previousX = 0
    let previousY = 0
    return simplified.map(([pointX, pointY]) => {
        const delta = [pointX - previousX, pointY - previousY]
        previousX = pointX
        previousY = pointY
        return delta
    })
})

fs.writeFileSync(inputPath, JSON.stringify(topology))
