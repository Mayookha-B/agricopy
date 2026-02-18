import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  MDBCard, MDBCardBody, MDBCardTitle, MDBIcon, 
  MDBTypography, MDBSpinner, MDBRow, MDBCol, MDBBadge
} from 'mdb-react-ui-kit';

const WeatherCard = ({ customColor }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = '6bb9e303bfa7bb04949c5c531b5fbe0b'; 
  const DEFAULT_CITY = 'Thiruvananthapuram'; 

  const fetchWeatherData = useCallback(async (lat, lon, city) => {
    setLoading(true);
    setError(null);
    
    let currentUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}`;
    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${API_KEY}`;

    if (lat && lon) {
      currentUrl += `&lat=${lat}&lon=${lon}`;
      forecastUrl += `&lat=${lat}&lon=${lon}`;
    } else {
      currentUrl += `&q=${city}`;
      forecastUrl += `&q=${city}`;
    }

    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(currentUrl),
        axios.get(forecastUrl)
      ]);

      setWeather(currentRes.data);
      setForecast(forecastRes.data.list.slice(0, 8)); // Next 24 hours
      setLoading(false);
    } catch (err) {
      setError("Weather sync failed.");
      setLoading(false);
    }
  }, [API_KEY]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherData(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherData(null, null, DEFAULT_CITY)
      );
    } else {
      fetchWeatherData(null, null, DEFAULT_CITY);
    }
  }, [fetchWeatherData]);

  const getWeatherIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('cloud')) return 'cloud';
    if (desc.includes('rain')) return 'cloud-showers-heavy';
    if (desc.includes('clear')) return 'sun';
    return 'cloud-sun';
  };

  // Logic to check if rain is expected in the next 24 hours
  const isRainIncoming = forecast.some(item => item.pop > 0.5);

  if (loading) return (
    <MDBCard className="text-center h-100 shadow-sm d-flex align-items-center justify-content-center py-5">
      <MDBSpinner color='success' />
    </MDBCard>
  );

  return (
    <MDBCard className="h-100 shadow-sm" style={{ borderTop: `5px solid ${customColor}`, borderRadius: '15px' }}>
      <MDBCardBody className="p-3">
        {/* Current Status Header */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <MDBIcon fas icon={getWeatherIcon(weather.weather[0].description)} size="2x" style={{ color: customColor }} />
          <div className="text-end">
            <h6 className="mb-0 fw-bold">{weather.name}</h6>
            <small className="text-muted" style={{fontSize: '0.65rem'}}>Live Farm Feed</small>
          </div>
        </div>

        <div className="text-center mb-3">
          <h2 className="fw-bold mb-0">{Math.round(weather.main.temp)}°C</h2>
          <small className="text-capitalize fw-bold" style={{ color: customColor }}>{weather.weather[0].description}</small>
        </div>

        {/* --- HR-WISE FORECAST SCROLL --- */}
        <div className="mt-2">
          <small className="fw-bold text-uppercase d-block mb-2 text-muted" style={{ letterSpacing: '1px', fontSize: '0.6rem' }}>
            <MDBIcon far icon="clock" className="me-1" /> 24-Hour Forecast
          </small>
          
          <div className="d-flex overflow-auto pb-2" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style>{`.d-flex::-webkit-scrollbar { display: none; }`}</style>
            {forecast.map((item, index) => (
              <div key={index} className="text-center px-3 border-end" style={{ minWidth: '70px' }}>
                <small className="d-block mb-1 text-muted" style={{ fontSize: '0.7rem' }}>
                  {new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                </small>
                <MDBIcon fas icon={getWeatherIcon(item.weather[0].description)} className="mb-1" style={{ color: customColor, fontSize: '0.9rem' }} />
                <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{Math.round(item.main.temp)}°</div>
                <small className={item.pop > 0.4 ? "text-danger" : "text-info"} style={{ fontSize: '0.65rem' }}>
                   <MDBIcon fas icon="tint" size="xs" /> {Math.round(item.pop * 100)}%
                </small>
              </div>
            ))}
          </div>
        </div>

        {/* --- DYNAMIC AGRI-INSIGHT --- */}
        <div className={`mt-3 p-2 rounded-3 border border-dashed ${isRainIncoming ? 'bg-warning-light' : 'bg-light'}`}>
          <div className="d-flex justify-content-between align-items-center">
            <small className="fw-bold text-success"><MDBIcon fas icon="leaf" /> AGRI-INSIGHT</small>
            <small className="fw-bold" style={{ color: '#d35400' }}>
              Soil: {Math.round(weather.main.temp * 0.9)}°C
            </small>
          </div>
          {isRainIncoming ? (
            <div className="mt-1 text-danger fw-bold" style={{ fontSize: '0.65rem' }}>
              <MDBIcon fas icon="exclamation-circle" className="me-1" /> High rain probability. Delay irrigation.
            </div>
          ) : (
            <div className="mt-1 text-muted" style={{ fontSize: '0.65rem' }}>
              Weather stable for the next 24 hours.
            </div>
          )}
        </div>

        <div className="text-end mt-2">
          <small 
            className="text-muted cursor-pointer" 
            style={{ fontSize: '0.65rem', cursor: 'pointer' }} 
            onClick={() => window.location.reload()}
          >
            <MDBIcon fas icon="sync-alt" className="me-1" /> Update Now
          </small>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
};

export default WeatherCard;