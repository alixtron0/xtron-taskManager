import React, { useState } from 'react';
import moment from 'moment-jalaali';
import { TextField } from '@mui/material';

const FarsiDatePicker = ({ value, onChange, isRTL }) => {
  const [selectedDate, setSelectedDate] = useState(value || (isRTL ? moment().format('jYYYY/jMM/jDD') : moment().format('YYYY/MM/DD')));

  const validateDateFormat = (date) => {
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    return regex.test(date);
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    if (validateDateFormat(date)) {
      setSelectedDate(date);
      onChange(date);
    } else {
      // Optionally handle invalid format
      console.error('Invalid date format. Please use YYYY/MM/DD.');
    }
  };

  return (
    <div>
      <TextField
        label="تاریخ را وارد کنید"
        variant="outlined"
        value={selectedDate}
        onChange={handleDateChange}
        placeholder={moment().format('jYYYY/jMM/jDD')}
        fullWidth
        InputLabelProps={{ style: { textAlign: 'center' } }} // Left-align the label
      />
    </div>
  );
};

export default FarsiDatePicker;
