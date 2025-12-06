// App.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import StoreFront from '../components/StoreFront';

const Client = () => {
   const { id } = useParams();

   return (
      <div className="min-h-screen bg-gray-50">
         <StoreFront storeId={id} isWarehouse={true} />
      </div>
   );
};

export default Client;