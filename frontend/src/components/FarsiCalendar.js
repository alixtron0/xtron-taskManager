import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, Button } from '@mui/material';

const CalendarContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '20px 0',
}));

const YearMonthDaySelector = ({ onDateChange }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());

  const handleSubmit = () => {
    const selectedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    onDateChange(selectedDate);
  };

  return (
    <CalendarContainer>
      <TextField
        type="number"
        label="Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        inputProps={{ min: 1399, max: 1500 }} // Adjust based on the Farsi calendar range
      />
      <TextField
        type="number"
        label="Month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        inputProps={{ min: 1, max: 12 }}
      />
      <TextField
        type="number"
        label="Day"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        inputProps={{ min: 1, max: 31 }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Select Date
      </Button>
    </CalendarContainer>
  );
};

export default YearMonthDaySelector;
