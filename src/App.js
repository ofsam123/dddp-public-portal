import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './component/header/Home';
import LisaHome from './component/lisa-platform/home/LisaHome';
import About from './component/about/About';
import AnalyticsSuccess from './component/blog/AnalyticsSuccess';
// import ClimateChange from './component/lisa-platform/climate/ClimateChange';
import TodayForecast from './component/lisa-platform/forcast/all-forcast/TodayForecast';
import AllForecast from './component/lisa-platform/forcast/all-forcast/AllForecast';
import Overview from './component/lisa-platform/overview/Overview';
import OverviewLocal from './component/lisa-platform/overview/OverviewLocal';
import CapacityBuilding from './component/lisa-platform/news/CapacityBuilding';
import Training from './component/lisa-platform/news/Training';
import DistrictDevelopment from './component/lisa-platform/news/DistrictDevelopment';
import Vulnerability from './component/lisa-platform/news/Vulnerability';
import CroudFunding from './component/lisa-platform/news/CroudFunding';
import GmetProducts from './component/lisa-platform/information/GmetProducts';
import Agrometeorological from './component/lisa-platform/information/Agrometeorological';
import Climate from './component/lisa-platform/information/Climate';
import DailyForeCast from './component/lisa-platform/information/DailyForeCast';
import Drought from './component/lisa-platform/information/Drought';
import Marine from './component/lisa-platform/information/Marine';
import Seasonal from './component/lisa-platform/information/Seasonal';
import Dashboard from './component/lisa-platform/dashbaord/Dashboard';
import ProductDetails from './component/lisa-platform/information/ProductDetails';

const ClimateChange = lazy(() => import('./component/lisa-platform/climate/ClimateChange'));

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/" element={<Navigate to="/lisa" replace />} /> */}
            <Route path="/lisa" element={<LisaHome />} />
            <Route path='/about' element={<About />} />
            <Route path='/analytics' element={<AnalyticsSuccess />} />
            <Route path='/today-forcast' element={<TodayForecast />} />
            <Route path='/climate' element={<ClimateChange />} />
            <Route path='/all-forcast' element={<AllForecast />} />
            <Route path='/lisa-overview' element={<Overview />} />
            <Route path='/local-overview' element={<OverviewLocal />} />
            <Route path='/capacity-building' element={<CapacityBuilding />} />
            <Route path='/training' element={<Training />} />
            <Route path='/district-development' element={<DistrictDevelopment />} />
            <Route path='/vulnerability' element={<Vulnerability />} />
            <Route path='/crowdfunding' element={<CroudFunding />} />
            {/* <Route path='/gmet-product' element={<GmetProducts />} /> */}
            <Route path='/agrometeo' element={<Agrometeorological />} />
            <Route path='/climate-product' element={<Climate/>} />
            <Route path='/daily-forecast' element={<DailyForeCast/>} />
            <Route path='/product-details' element={<ProductDetails />} />
            <Route path='/Drought' element={<Drought/>} />
            <Route path='/marine' element={<Marine/>} />
            <Route path='seasonal' element={<Seasonal />} />
            <Route path='/dashboard' element= {<Dashboard />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
