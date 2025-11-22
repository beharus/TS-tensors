// App.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import StoreFront from './components/StoreFront';
import StoreIdForm from './components/StoreIdForm';

const App = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      {id ? <StoreFront storeId={id} /> : <StoreIdForm />}
    </div>
  );
};

export default App;