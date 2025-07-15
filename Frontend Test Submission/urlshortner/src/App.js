import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Log } from './logger';
import UrlShortener from './UrlShortener';

const MAX_URLS = 5;

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidShortcode(code) {
  return /^[a-zA-Z0-9]{3,15}$/.test(code); // Alphanumeric, 3-15 characters
}

const defaultUrlEntry = { url: '', validity: '', shortcode: '', error: '' };

function App() {
  return (
    <div className="App">
      <UrlShortener />
    </div>
  );
}

export default App;
