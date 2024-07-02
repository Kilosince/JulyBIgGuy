import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import '../styles/Home.css'; // Ensure this path is correct

const Home = () => {
  return (
    <div className="container" style={{ backgroundColor: 'white', padding: '20px' }}>
      <h1 className="heading">Welcome</h1>
      <div className="carouselContainer">
        <Carousel
          showThumbs={false}
          autoPlay={true}
          infiniteLoop={true}
          interval={5000} // Set the interval to 10 seconds
          transitionTime={1000} // Set the transition time to 1 second
        >
          <div>
            <img src="/paper.png" alt="HotPot" className="image" />
          </div>
          <div>
            <img src="/clock.png" alt="HotPot" className="image" />
          </div>
          <div>
            <img src="/sponsored.png" alt="HotPot" className="image" />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default Home;
