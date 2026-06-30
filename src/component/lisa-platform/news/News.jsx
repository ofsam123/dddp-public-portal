import React from 'react'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Card from 'react-bootstrap/Card';
import VulnerabilityImage from '../../static/images/img/vulnerability.jpg'
import TrainingImage from '../../static/images/img/training3.jpg'
import DistrictDevelopmentImage from '../../static/images/img/district-development.jpg'
import CroudFundingImage from '../../static/images/img/croud-funding2.jpg'
import CapacityBuildingImage from '../../static/images/img/capacity-building 2.jpg'
import './News.css'
import styled from 'styled-components';
import { DoubleRightOutlined } from '@ant-design/icons'
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { calc } from 'antd/es/theme/internal';



const StyledLink = styled.a`
  text-decoration: none;
  color: #00910E;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    svg {
      transform: translateX(5px);
      transition: transform 0.3s ease-in-out;
    }
  }
`;

const News = () => {

    const newsData = [
        {
            title: 'Capacity building',
            description: 'Efforts to enhance the LISA platform as a more robust system for district assemblies was further continued in the reporting year. The platform’s primary function is to supply essential climate data for...',
            image: CapacityBuildingImage,
            headline: 'CAPACITY BUILDING',
            href: '/capacity-building'
        },
        {
            title: 'Training for the local ACE districts',
            description: 'UNCDF in collaboration with MLGDRD organised a subsequent training workshop for the three LoCAL-ACE Districts, which took place from the 26th-27th March at the Pempamsie Hotel in Cape Coast...',
            image: TrainingImage,
            headline: 'TRAINING',
            href: '/training'
        },
        {
            title: 'District Development',
            description: 'This event underscored the importance of data in political decision-making and as a critical tool for tracking development progress and enhancing government accountability...',
            image: DistrictDevelopmentImage,
            headline: 'DISTRICT DEVELOPMENT',
            href: '/district-development'
        },
        {
            title: 'Vulnerability Assessment',
            description: 'The objective of the workshop was to build the capacity of local government officials to conduct rapid climate vulnerability assessments using the LISA platform...',
            image: VulnerabilityImage,
            headline: 'VULNERABILITY',
            href: '/vulnerability'
        },
        {
            title: 'Crowdfunding Training',
            description: 'Expanding local fiscal capability is a key objective for UNCDF and, by extension, the GrEEn Project. In this context, the concept of crowdfunding as a funding source...',
            image: CroudFundingImage,
            headline: 'CROWDFUNDING',
            href: '/crowdfunding'
        },
    ];

    const cards = newsData.map((news, i) => (
        <div key={i}>
            <Card className='news-card' style={{ textAlign: 'left', width: '25rem', boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px', border: '1px solid white', marginBottom: '5rem' }}>
                <div className='container'>
                    <Card.Img variant="top" src={news.image} style={{ backgroundColor: '#EFF1FE', maxHeight: '365px', overflow: 'hidden' }} />
                    <h6 className='headline'>{news.headline}</h6>
                </div>

                <Card.Body style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
                    <div style={{ marginTop: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        {/* <CalendarOutlined style={{ color: '#0B6000', marginRight: '0.5rem' }} /> */}
                        <h6 style={{ color: '#00910E', margin: '0' }}>{news.PublishedDate}</h6>
                    </div>
                    <Card.Title style={{ color: '#0B6000', fontSize: '1.8rem' }}>{news.title}</Card.Title>
                    <Card.Text style={{ color: '#255A13' }}>
                        {news.description}
                    </Card.Text>
                </Card.Body>
                <Card.Body style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                    <StyledLink href={news.href} >
                        READ MORE <DoubleRightOutlined />
                    </StyledLink>
                </Card.Body>
            </Card>
        </div>
    ));

    const renderArrowPrev = (onClickHandler, hasPrev, label) =>
        hasPrev && (
            <button type="button" onClick={onClickHandler} title={label} style={{ ...arrowStyles, left: 15 }}>
                <LeftOutlined style={iconStyles} />
            </button>
        );

    const renderArrowNext = (onClickHandler, hasNext, label) =>
        hasNext && (
            <button type="button" onClick={onClickHandler} title={label} style={{ ...arrowStyles, right: 15 }}>
                <RightOutlined style={iconStyles}/>
            </button>
        );
    // Arrow styles
    const arrowStyles = {
        position: 'absolute',
        zIndex: 2,
        top: 'calc(47% - 15px)',
        width: 40,
        height: 40,
        cursor: 'pointer',
        backgroundColor: 'rgba(0, 200, 0, 0.7)',
        border: 'none',
        color: 'white',
        borderRadius: '50%',
    };

    const iconStyles = {
        fontSize: '17px',
        position: 'relative',
        top: 'calc(35% - 15px)',
    };

    return (
        <div className='news-main' style={{ width: '80%', margin: '0 auto', marginBottom: '10rem' }}>
            <h4 style={{ color: '#0B6000', marginBottom: '4rem', fontSize: '2rem', marginTop: '10rem' }}>LISA NEWS UPDATES</h4>
            <Carousel autoPlay transitionTime={1000} infiniteLoop showThumbs={false} showStatus={false} showIndicators={false} dynamicHeight={false} centerMode centerSlidePercentage={34}
                renderArrowPrev={renderArrowPrev}
                renderArrowNext={renderArrowNext}
            >
                {cards}
            </Carousel>
        </div>
    )
}

export default News