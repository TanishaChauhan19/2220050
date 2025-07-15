import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid } from '@mui/material';

// Placeholder logging function
const log = (message) => {
  console.log(message);
};

const DEFAULT_VALIDITY = 30; // minutes
const MAX_URLS = 5;
const SHORTCODE_REGEX = /^[a-zA-Z0-9]{3,12}$/;

function generateRandomShortcode(existingShortcodes) {
  let code;
  do {
    code = Math.random().toString(36).substring(2, 8);
  } while (existingShortcodes.has(code));
  return code;
}

const initialUrlEntry = { url: '', validity: '', shortcode: '', error: {} };

export default function UrlShortener() {
  const [urlEntries, setUrlEntries] = useState([
    { ...initialUrlEntry },
  ]);
  const [results, setResults] = useState([]);
  const [shortcodeMap, setShortcodeMap] = useState({}); // { shortcode: { url, expiry, createdAt } }

  const handleChange = (idx, field, value) => {
    const newEntries = [...urlEntries];
    newEntries[idx][field] = value;
    setUrlEntries(newEntries);
  };

  const handleAdd = () => {
    if (urlEntries.length < MAX_URLS) {
      setUrlEntries([...urlEntries, { ...initialUrlEntry }]);
    }
  };

  const handleRemove = (idx) => {
    if (urlEntries.length > 1) {
      setUrlEntries(urlEntries.filter((_, i) => i !== idx));
    }
  };

  const validateEntry = (entry, existingShortcodes) => {
    const error = {};
    // URL validation
    try {
      new URL(entry.url);
    } catch {
      error.url = 'Invalid URL format';
    }
    // Validity validation
    if (entry.validity) {
      if (!/^\d+$/.test(entry.validity) || parseInt(entry.validity) <= 0) {
        error.validity = 'Validity must be a positive integer (minutes)';
      }
    }
    // Shortcode validation
    if (entry.shortcode) {
      if (!SHORTCODE_REGEX.test(entry.shortcode)) {
        error.shortcode = 'Shortcode must be 3-12 alphanumeric characters';
      } else if (existingShortcodes.has(entry.shortcode)) {
        error.shortcode = 'Shortcode already in use';
      }
    }
    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    log('Submitting URL entries');
    const existingShortcodes = new Set(Object.keys(shortcodeMap));
    const newResults = [];
    const newShortcodeMap = { ...shortcodeMap };
    let hasError = false;
    const newEntries = urlEntries.map((entry) => {
      const error = validateEntry(entry, existingShortcodes);
      if (Object.keys(error).length > 0) {
        hasError = true;
        return { ...entry, error };
      }
      // Generate or use shortcode
      let shortcode = entry.shortcode;
      if (!shortcode) {
        shortcode = generateRandomShortcode(existingShortcodes);
      }
      existingShortcodes.add(shortcode);
      // Validity
      const validity = entry.validity ? parseInt(entry.validity) : DEFAULT_VALIDITY;
      const createdAt = new Date();
      const expiry = new Date(createdAt.getTime() + validity * 60000);
      // Save mapping
      newShortcodeMap[shortcode] = {
        url: entry.url,
        createdAt: createdAt.toISOString(),
        expiry: expiry.toISOString(),
        clicks: [],
      };
      newResults.push({
        originalUrl: entry.url,
        shortcode,
        expiry: expiry.toISOString(),
      });
      log(`Shortened: ${entry.url} -> ${shortcode}`);
      return { ...initialUrlEntry };
    });
    setUrlEntries(newEntries);
    if (!hasError) {
      setResults(newResults);
      setShortcodeMap(newShortcodeMap);
    } else {
      setResults([]);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          URL Shortener
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {urlEntries.map((entry, idx) => (
              <Grid item xs={12} key={idx}>
                <Paper sx={{ p: 2, mb: 1 }} variant="outlined">
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        label="Long URL"
                        value={entry.url}
                        onChange={(e) => handleChange(idx, 'url', e.target.value)}
                        fullWidth
                        required
                        error={!!entry.error.url}
                        helperText={entry.error.url}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Validity (min)"
                        value={entry.validity}
                        onChange={(e) => handleChange(idx, 'validity', e.target.value)}
                        fullWidth
                        error={!!entry.error.validity}
                        helperText={entry.error.validity}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Custom Shortcode"
                        value={entry.shortcode}
                        onChange={(e) => handleChange(idx, 'shortcode', e.target.value)}
                        fullWidth
                        error={!!entry.error.shortcode}
                        helperText={entry.error.shortcode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemove(idx)}
                        disabled={urlEntries.length === 1}
                        sx={{ mr: 1 }}
                      >
                        Remove
                      </Button>
                      {idx === urlEntries.length - 1 && urlEntries.length < MAX_URLS && (
                        <Button variant="outlined" color="primary" onClick={handleAdd}>
                          Add
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button type="submit" variant="contained" color="primary">
              Shorten URLs
            </Button>
          </Box>
        </form>
        {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Shortened URLs</Typography>
            {results.map((res, idx) => (
              <Paper key={idx} sx={{ p: 2, mt: 1 }}>
                <Typography>
                  <strong>Original:</strong> {res.originalUrl}
                </Typography>
                <Typography>
                  <strong>Short URL:</strong> http://localhost:3000/{res.shortcode}
                </Typography>
                <Typography>
                  <strong>Expires at:</strong> {new Date(res.expiry).toLocaleString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
} 