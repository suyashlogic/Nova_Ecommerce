import { useEffect, useState } from 'react';
import api from './services/api';

export default function App() {
  const [status, setStatus] = useState('Checking API...');

  // useEffect runs after the component first renders, which is the
  // right place to call an API. The [] means "run once".
  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(`API: ${res.data.status}, DB: ${res.data.database}`))
      .catch(() => setStatus('Cannot reach API'));
  }, []);

  return <div className="container py-5"><h1>NOVA</h1><p>{status}</p></div>;
}