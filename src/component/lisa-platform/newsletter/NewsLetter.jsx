import { Input, Button } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';

const NewsLetter = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F5F7FE', height: '25vh', width: '85%', margin: '0 auto', marginTop: '3rem', marginBottom: '5rem', }}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#0B6000' }}>
                <p style={{ padding: '5px 15px', fontWeight: '500', background: 'linear-gradient(to left, #fff 2.23%, #eff1fd 97.21%)' }}>NEWSLETTER</p>
                <h2>Subscribe For Newsletter</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Input type='email' placeholder='Your Email' style={{ width: '25rem', height: '2.5rem' }} onFocus={(e) => e.target.style.borderColor = '#0B6000'} onBlur={(e) => e.target.style.borderColor = ''} />
                <Button style={{ backgroundColor: '#00910E', height: '2.5rem', color: 'white', marginLeft: '-1px' }} icon={<DoubleRightOutlined />}>Submit</Button>
            </div>

        </div>
    )
}

export default NewsLetter;