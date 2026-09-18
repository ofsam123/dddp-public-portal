import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './component/header/Home';

const lazyRoute = (importer, exportName = 'default') => lazy(() => (
  importer().then((module) => ({ default: module[exportName] }))
));

const ExploreLanding = lazyRoute(() => import('./component/explore/ExplorePages'), 'ExploreLanding');
const GhanaOverview = lazyRoute(() => import('./component/explore/ExplorePages'), 'GhanaOverview');
const RegionPage = lazyRoute(() => import('./component/explore/ExplorePages'), 'RegionPage');
const DistrictPage = lazyRoute(() => import('./component/explore/ExplorePages'), 'DistrictPage');
const LisaHome = lazyRoute(() => import('./component/lisa-platform/home/LisaHome'));
const About = lazyRoute(() => import('./component/about/About'));
const AnalyticsSuccess = lazyRoute(() => import('./component/blog/AnalyticsSuccess'));
const TodayForecast = lazyRoute(() => import('./component/lisa-platform/forcast/all-forcast/TodayForecast'));
const AllForecast = lazyRoute(() => import('./component/lisa-platform/forcast/all-forcast/AllForecast'));
const Overview = lazyRoute(() => import('./component/lisa-platform/overview/Overview'));
const OverviewLocal = lazyRoute(() => import('./component/lisa-platform/overview/OverviewLocal'));
const CapacityBuilding = lazyRoute(() => import('./component/lisa-platform/news/CapacityBuilding'));
const Training = lazyRoute(() => import('./component/lisa-platform/news/Training'));
const DistrictDevelopment = lazyRoute(() => import('./component/lisa-platform/news/DistrictDevelopment'));
const Vulnerability = lazyRoute(() => import('./component/lisa-platform/news/Vulnerability'));
const CroudFunding = lazyRoute(() => import('./component/lisa-platform/news/CroudFunding'));
const News = lazyRoute(() => import('./component/lisa-platform/news/News'));
const Agrometeorological = lazyRoute(() => import('./component/lisa-platform/information/Agrometeorological'));
const Climate = lazyRoute(() => import('./component/lisa-platform/information/Climate'));
const DailyForeCast = lazyRoute(() => import('./component/lisa-platform/information/DailyForeCast'));
const ProductDetails = lazyRoute(() => import('./component/lisa-platform/information/ProductDetails'));
const Drought = lazyRoute(() => import('./component/lisa-platform/information/Drought'));
const Marine = lazyRoute(() => import('./component/lisa-platform/information/Marine'));
const Seasonal = lazyRoute(() => import('./component/lisa-platform/information/Seasonal'));
const Dashboard = lazyRoute(() => import('./component/lisa-platform/dashbaord/Dashboard'));
const ClimateChange = lazyRoute(() => import('./component/lisa-platform/climate/ClimateChange'));

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreLanding />} />
            <Route path="/explore/ghana" element={<GhanaOverview />} />
            <Route path="/explore/regions/:regionSlug" element={<RegionPage />} />
            <Route path="/explore/regions/:regionSlug/districts/:districtSlug" element={<DistrictPage />} />
            {/* <Route path="/" element={<Navigate to="/lisa" replace />} /> */}
            <Route path="/lisa" element={<LisaHome />} />
            <Route path='/about' element={<About />} />
            <Route path='/analytics' element={<AnalyticsSuccess />} />
            <Route path='/today-forcast' element={<TodayForecast />} />
            <Route path='/climate' element={<ClimateChange />} />
            <Route path='/all-forcast' element={<AllForecast />} />
            <Route path='/lisa-overview' element={<Overview />} />
            <Route path='/local-overview' element={<OverviewLocal />} />
            <Route path='/updates' element={<News />} />
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
