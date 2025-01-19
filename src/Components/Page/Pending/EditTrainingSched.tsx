'use client';

import { useState, useEffect } from 'react';
import { Box, Text, Input, Button, useToast, FormControl } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';

import { useTraining } from '@/context/TrainingContext';
import { ToastStatus } from '@/types/handling';

import { UPDATE_TS, UPDATE_COURSE_FEE } from '@/lib/trainee_controller';

interface PageProps {
 training_id: string;
 td: string;
 onClose: () => void;
}

export default function Page({ training_id, td, onClose }: PageProps) {
  const toast = useToast();
  const { data: allTraining } = useTraining();

  const [loading, setLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [courseFee, setFee] = useState<number>(0);

  // Find the training object
  const training = allTraining?.find((t) => t.id === training_id);

  useEffect(() => {
    if (training) {
      setFee(training.course_fee || 0); // Initialize course fee
    }
  }, [training]);

  if (!training) return null; // Early return if training not found

  const handleFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFee(Number(value));
  };

  const handleNewTS = async () => {
    setLoading(true);
    const actor: string | null = localStorage.getItem('customToken');

    new Promise<void>((res, rej) => {
      setTimeout(async () => {
        try {
          const startDateStr = startDate
            ? new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
              }).format(startDate)
            : '';

          const endDateStr = endDate
            ? new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
              }).format(endDate)
            : '';

          await UPDATE_TS(training.id, startDateStr, training.end_date ? endDateStr : '', actor);
          res();
        } catch (error) {
          rej(error);
        }
      }, 1500);
    })
    .then(() => {
      handleToast( 'Training Date Updated Successfully!', `You have successfully changed this training's schedule, and it will be logged.`, 7000, 'success' )
      onClose();
    })
    .catch((error) => {
      console.log('Error:', error);
    })
    .finally(() => {
      setLoading(false);
    })
  }

  const handleNewFee = async () => {
    setLoading(true);
    const actor: string | null = localStorage.getItem('customToken');

    new Promise<void>((res, rej) => {
      setTimeout(async () => {
        try {
          await UPDATE_COURSE_FEE(training.id, courseFee, actor);
          res();
        } catch (error) {
          rej(error);
        }
      }, 1500);
    })
    .then(() => {
      handleToast( 'Training Fee Updated Successfully!', `You have successfully changed this training's fee, and it will be logged.`, 7000, 'success' );
      onClose();
    })
    .catch((error) => {
      console.log('Error:', error);
    })
    .finally(() => {
      setLoading(false);
    })
  };

  const handleToast = ( title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
    toast({ title: title, description: desc, position: 'top-right', variant: 'left-accent', status: status, duration: timer, isClosable: true,})
  }

  return (
    <>
      {td === 'ts' && (
        <Box className="w-full space-y-4">
          <Box className="flex uppercase space-x-6">
            <Text className="text-sm text-gray-400">Old Training Date:</Text>
            <Text className="text-sm">
              {`${training.start_date} ${
                training.end_date === '' ? '' : `to ${training.end_date}`
              }`}
            </Text>
          </Box>
          <Box className="space-y-4">
            <FormControl className="flex flex-col">
              <label className="text-gray-400">New Start Date:</label>
              <DatePicker showPopperArrow={false} selected={startDate} onChange={(date) => setStartDate(date)} showMonthDropdown useShortMonthInDropdown dateFormat="E, MMM. dd"
                customInput={<Input id="startDate" textAlign="start" className="shadow-md" />} />
            </FormControl>
            {training.end_date !== '' && (
              <FormControl className="flex flex-col">
                <label className="text-gray-400">New End Date:</label>
                <DatePicker showPopperArrow={false} selected={endDate} onChange={(date) => setEndDate(date)} showMonthDropdown useShortMonthInDropdown dateFormat="E, MMM. dd" 
                  customInput={<Input id="endDate" textAlign="start" className="shadow-md" />} />
              </FormControl>
            )}
          </Box>
          <Box className="w-full flex justify-end">
            <Button onClick={handleNewTS} colorScheme="blue" isLoading={loading} loadingText="Saving...">
              Save
            </Button>
          </Box>
        </Box>
      )}
      {td === 'cf' && (
        <Box className="w-full space-y-4">
          <Box>
            <FormControl className="space-y-3">
              <label className="text-gray-400 text-base">Course Fee</label>
              <Input onChange={handleFee} value={courseFee} type="number" className="shadow-md" />
            </FormControl>
          </Box>
          <Box className="w-full flex justify-end">
            <Button onClick={handleNewFee} colorScheme="blue" isLoading={loading} loadingText="Saving...">
              Save
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}
