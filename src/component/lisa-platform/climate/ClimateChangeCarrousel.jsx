import React, { useEffect, useState } from 'react'
import { Carousel } from 'antd';

const contentStyle = {
    height: 'auto',
    color: '#fff',
    lineHeight: '300px',
    textAlign: 'center',
    background: '#364d79',
    overflow: 'hidden'
};


const ClimateChangeCarrousel = ({ dataElementId, dataElementUids, currentPage }) => {
    const [imgSrcs, setImgSrcs] = useState([]);

    useEffect(() => {
        const username = 'msow';
        const password = 'dpGhana@2022';
        const promises = [];

        // Only fetch images for the current page
        const id = dataElementId[currentPage - 0];
        const currentPageDataElementUids = dataElementUids[currentPage - 0];

        if (Array.isArray(currentPageDataElementUids)) {
            currentPageDataElementUids.forEach(dataElementUid => {
                const url = `https://dddp.gov.gh/api/events/files?eventUid=${id}&dataElementUid=${dataElementUid}`;
        
                const promise = fetch(url, {
                    headers: new Headers({
                        'Authorization': 'Basic ' + btoa(username + ":" + password),
                    }),
                })
                    .then(response => {
                        if (response.status !== 200) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        } else if (response.status === 409) {
                            throw new Error('Conflict with the current state of the resource');
                        }
                        return response.blob();
                    })
                    .then(blob => URL.createObjectURL(blob))
                    .catch(error => {
                        // console.error(`Fetch failed for ${url}: ${error.message}`);
                        return null;
                    });
        
                promises.push(promise);
            });
        } else {
            console.error('currentPageDataElementUids is undefined or not an array');
        }

        Promise.all(promises)
            .then(urls => setImgSrcs(urls.filter(url => url !== null)))
        // .catch(console.error);
    }, [dataElementId, dataElementUids, currentPage]);

    return (
        <Carousel autoplay>
            {imgSrcs.map((src, index) => (
                src && (
                    <div key={index}>
                        <h3 style={contentStyle}>
                            <img src={src} alt={`Climate ${index}`} style={{ width: '100%', maxHeight: '800px' }} />
                        </h3>
                    </div>
                )
            ))}
        </Carousel>
    )
}

export default ClimateChangeCarrousel