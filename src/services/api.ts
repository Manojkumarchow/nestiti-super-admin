import axios from 'axios';

const API = axios.create({
  baseURL: 'http://13.63.188.62:8080/whistleup',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
