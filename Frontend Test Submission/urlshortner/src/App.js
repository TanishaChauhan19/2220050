import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Log } from './logger';

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
  const [urls, setUrls] = useState([
    { ...defaultUrlEntry },
  ]);
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Log('frontend', 'info', 'App', 'App mounted');
  }, []);

  const handleChange = (idx, field, value) => {
    const newUrls = [...urls];
    newUrls[idx][field] = value;
    newUrls[idx].error = '';
    setUrls(newUrls);
  };

  const addUrlField = () => {
    if (urls.length < MAX_URLS) {
      setUrls([...urls, { ...defaultUrlEntry }]);
      Log('frontend', 'info', 'App', 'Added new URL input field');
    }
  };

  const removeUrlField = (idx) => {
    const newUrls = urls.filter((_, i) => i !== idx);
    setUrls(newUrls);
    Log('frontend', 'info', 'App', `Removed URL input field at index ${idx}`);
  };

  const validateInputs = () => {
    let valid = true;
    const newUrls = urls.map((entry) => {
      let error = '';
      if (!isValidUrl(entry.url)) {
        error = 'Invalid URL format';
        valid = false;
      } else if (entry.shortcode && !isValidShortcode(entry.shortcode)) {
        error = 'Shortcode must be 3-15 alphanumeric chars';
        valid = false;
      } else if (entry.validity && (!/^[0-9]+$/.test(entry.validity) || parseInt(entry.validity) <= 0)) {
        error = 'Validity must be a positive integer (minutes)';
        valid = false;
      }
      return { ...entry, error };
    });
    setUrls(newUrls);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Log('frontend', 'info', 'App', 'Form submitted');
    if (!validateInputs()) {
      Log('frontend', 'error', 'App', 'Validation failed');
      return;
    }
    setSubmitting(true);
    setResults([]);
    const now = new Date();
    const newResults = [];
    const updatedUrls = [...urls];
    for (let i = 0; i < urls.length; i++) {
      const entry = urls[i];
      const validity = entry.validity ? parseInt(entry.validity) : 30;
      const payload = {
        url: entry.url,
        validity,
      };
      if (entry.shortcode) payload.shortcode = entry.shortcode;
      try {
        Log('frontend', 'info', 'App', `Sending API request for URL: ${entry.url}`);
        const response = await fetch('http://localhost:5000/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorText = await response.text();
          updatedUrls[i].error = `API error: ${errorText}`;
          Log('frontend', 'error', 'App', `API error for URL ${entry.url}: ${errorText}`);
          continue;
        }
        const data = await response.json();
        newResults.push({
          original: entry.url,
          short: data.shortUrl,
          expiry: new Date(data.expiry).toLocaleString(),
        });
        Log('frontend', 'info', 'App', `Shortened URL created: ${data.shortUrl}`);
      } catch (err) {
        updatedUrls[i].error = `Network error: ${err.message}`;
        Log('frontend', 'error', 'App', `Network error for URL ${entry.url}: ${err.message}`);
      }
    }
    setResults(newResults);
    setUrls(updatedUrls);
    setSubmitting(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {urls.map((entry, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Long URL"
                      value={entry.url}
                      onChange={e => handleChange(idx, 'url', e.target.value)}
                      fullWidth
                      required
                      error={!!entry.error}
                      helperText={entry.error}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Validity (min)"
                      value={entry.validity}
                      onChange={e => handleChange(idx, 'validity', e.target.value)}
                      fullWidth
                      placeholder="30"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Custom Shortcode"
                      value={entry.shortcode}
                      onChange={e => handleChange(idx, 'shortcode', e.target.value)}
                      fullWidth
                      placeholder="Optional"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    {urls.length > 1 && (
                      <Button color="error" onClick={() => removeUrlField(idx)} disabled={submitting}>
                        Remove
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={addUrlField}
            disabled={urls.length >= MAX_URLS || submitting}
            sx={{ mr: 2 }}
          >
            Add URL
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            Shorten URLs
          </Button>
        </Box>
      </form>
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Shortened URLs</Typography>
          <Grid container spacing={2}>
            {results.map((res, idx) => (
              <Grid item xs={12} key={idx}>
                <Paper sx={{ p: 2 }}>
                  <Typography>Original: {res.original}</Typography>
                  <Typography>Short: <a href={res.short} target="_blank" rel="noopener noreferrer">{res.short}</a></Typography>
                  <Typography>Expires: {res.expiry}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default App;
