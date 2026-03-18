import axios from 'axios';

const API = axios.create({
  baseURL: '/api/whistleup',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
