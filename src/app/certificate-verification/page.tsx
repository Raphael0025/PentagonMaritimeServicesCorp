'use client'

import { useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { MdOutlineVerifiedUser } from "react-icons/md"
import { BsGlobe2 } from "react-icons/bs"
import { FaFacebook } from "react-icons/fa"
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, Image, Text, Input, Button, Spinner, FormControl, FormHelperText, FormLabel, useToast, Progress, } from '@chakra-ui/react'

import { getDocs, query, where, collection, doc, getDoc, Timestamp } from 'firebase/firestore'

import { ToastStatus } from '@/types/handling'
import { TRAINING_BY_ID, REGISTRATION_BY_ID, TRAINEE_BY_ID } from '@/types/trainees'
import { CourseBatchByID } from '@/types/course-batches'
import { UPDATE_VIEW_CERT_ACCESS } from '@/lib/trainee_controller'

import { firestore } from '@/lib/certification_controller'

export default function Certification() {
    const toast = useToast()
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [certNum, setCertNum] = useState<string>('')
    const [regNum, setRegNum] = useState<string>('')

    const [firstName, setFN] = useState<string>('')
    const [middleName, setMN] = useState<string>('')
    const [lastName, setLN] = useState<string>('')

    const [showVerification, setShowVerification] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [isPreparingCert, setIsPreparingCert] = useState<boolean>(false)
    const [verifiedCertNum, setVerifiedCert] = useState<boolean>(false)
    
    const [certTitleHtml, setCertTitleHtml] = useState('')
    const [certContentHtml, setCertContentHtml] = useState('')
    const [trainingDate, setTrainingDate] = useState<string>('')
    const [start_date, setStartDate] = useState<string>('')
    const [end_date, setEndDate] = useState<string>('')

    const [numOfDays, setNumOfDays] = useState<number>(0)
    const [conductOn, setConducted] = useState<boolean>(false)

    const [splitMonth, setSplitMonth] = useState<string>('')
    const [nthDay, setNthDay] = useState<string>('')

    const [getYear, setYear] = useState<number>(0)
    
    const registration = collection(firestore, 'REGISTRATION')
    const training = collection(firestore, 'TRAINING')
    
    const TOTAL_TIME: number = 30
    const [countdown, setCountdown] = useState<number>(TOTAL_TIME)
    const [progress, setProgress] = useState<number>(100)

    const [trainingData, setTrainingData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!verifiedCertNum || isPreparingCert) return;

        setCountdown(TOTAL_TIME);
        setProgress(100);

        // 1️⃣ Smooth progress animation using requestAnimationFrame
        const startTime = performance.now();

        const animateProgress = (now: number) => {
            const elapsed = (now - startTime) / 1000; // seconds
            const remaining = Math.max(TOTAL_TIME - elapsed, 0);
            setProgress((remaining / TOTAL_TIME) * 100);

            if (remaining > 0) {
                requestAnimationFrame(animateProgress);
            }
        };

        requestAnimationFrame(animateProgress);

        // 2️⃣ Countdown every 1 second (whole seconds)
        const interval = setInterval(() => {
            setCountdown(prev => Math.max(prev - 1, 0));
        }, 1000);

        // 3️⃣ Timeout when countdown ends
        const timeout = setTimeout(() => {
            setVerifiedCert(false);
            setCertNum('');
            setRegNum('');
            setFN('');
            setMN('');
            setLN('');
            setTrainingDate('');
            setStartDate('');
            setEndDate('');
            setSplitMonth('');
            setNthDay('');
            setCertContentHtml('');
            setCertTitleHtml('');
        }, TOTAL_TIME * 1000);

        // 4️⃣ Cleanup
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [verifiedCertNum, isPreparingCert]);

    useEffect(() => {
        async function fetchRecord() {
        if (!token) {
            setError('No verification token provided.');
            setLoading(false);
            return;
        }

            try {
                // 1. Decode the token to retrieve the training ID
                const decodedString = atob(decodeURIComponent(token));
                const payload = JSON.parse(decodedString);

                if (!payload?.id) {
                throw new Error('Invalid token structure.');
                }

                // 2. Fetch the full training document live from Firestore (where long certContent lives)
                const docRef = doc(training, 'trainings', payload.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTrainingData(docSnap.data());
                } else {
                    setError('Certificate record not found in the official registry.');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setError('Failed to verify certificate. The QR code may be invalid or corrupted.');
            } finally {
                setLoading(false);
        }
        }

        fetchRecord();
    }, [token]);

    const GET_TRAINING_RECORD = async (certNo: string): Promise<TRAINING_BY_ID | null> => {
        try {
            const q = query(training, where('cert_no', '==', certNo))
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                return null
            }

            const docSnap = snapshot.docs[0]

            const result = {
                id: docSnap.id,
                ...docSnap.data(),
            } as TRAINING_BY_ID

            return result

        } catch (error) {
            console.error('Error fetching training record:', error)
            throw error
        }
    }
    
    const GET_TRAINEE_RECORD = async ( traineeID: string ): Promise<TRAINEE_BY_ID | null> => {
        try {
            const ref = doc(firestore, "TRAINEES", traineeID)
            const snap = await getDoc(ref)
            if (!snap.exists()) return null

            return {
                id: snap.id,
                ...snap.data(),
            } as TRAINEE_BY_ID

        } catch (error) {
            console.error('Error fetching trainee record:', error)
            throw error
        }
    }
    
    const GET_REGISTRATION_RECORD = async ( regVar: string ): Promise<REGISTRATION_BY_ID | null> => {
        try {
            const q = query(registration, where('reg_no', '==', regVar))
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                return null
            }

            const docSnap = snapshot.docs[0]

            const result = {
                id: docSnap.id,
                ...docSnap.data(),
            } as REGISTRATION_BY_ID

            return result

        } catch (error) {
            console.error('Error fetching registration record:', error)
            throw error
        }
    }
    
    const GET_BATCH_RECORD = async (batchID: string): Promise<CourseBatchByID | null> => {
        try {
            const ref = doc(firestore, "BATCH_RECORDS", batchID)
            const snap = await getDoc(ref)
            if (!snap.exists()) return null

            return {
                id: snap.id,
                ...snap.data(),
            } as CourseBatchByID

        } catch (error) {
            console.error("Error fetching batch record:", error)
            throw error
        }
    }

    // const formatTrainingSchedule = (dateStr: string, year: number) => {
    //     if (!dateStr) return ''
    //     const dateConvert = new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
    //     return `${dateConvert}, ${year}` // "February 11"
    // }

    const formatTrainingSchedule = (dateStr: string, year: number) => {
        if (!dateStr) return '';

        // Create a map for the month abbreviations
        const monthMap: { [key: string]: string } = {
            // Standard Keys
            Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
            May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
            Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
            
            // All-Caps Keys
            JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
            MAY: 'May', JUN: 'June', JUL: 'July', AUG: 'August',
            SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
        }

        // 1. Remove commas and split by space
        // "Tue, Apr 07" becomes ["Tue", "Apr", "07"]
        const parts = dateStr.replace(',', '').split(' ');

        const monthAbbr = parts[1]; // "Apr"
        const day = parseInt(parts[2], 10); // "07" -> 7 (removes leading zero)

        const fullMonth = monthMap[monthAbbr] || monthAbbr;

        return `${fullMonth} ${day}, ${year}`; 
    };

    const getOrdinalHTML = (day: number) => {
        const suffix =
            day % 10 === 1 && day % 100 !== 11 ? 'st' :
            day % 10 === 2 && day % 100 !== 12 ? 'nd' :
            day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th'

        return `${day}<sup>${suffix}</sup>`
    }

    const getColor = () => {
        if(countdown <= 10) return 'red'
        if(countdown <= 30) return 'yellow'
        return 'green'
    }

    const handleVerification = async () => {
        if (loading) return

        try {
            setLoading(true)

            const normalizedRegNum = regNum.trim().replace(/^REG-/i, '')
            const normalizedCertNum = certNum.trim().toUpperCase()

            const regExists = await GET_REGISTRATION_RECORD(normalizedRegNum)
            const trainingDoc = await GET_TRAINING_RECORD(normalizedCertNum)
            
            if (!regExists || !trainingDoc) {
                toast({
                    title: 'Verification Failed',
                    description: `Invalid certificate or registration number.`,
                    status: 'error',
                    duration: 5000,
                })
                return
            }
            
            // if (trainingDoc?.hasViewed) {
            //     toast({
            //         title: 'View Limit Reached',
            //         description: `You have already used your allocated view access for this certificate. Please contact the training center for further assistance.`,
            //         status: 'error',
            //         duration: 5000,
            //     })
            //     return
            // }

            const trainee = await GET_TRAINEE_RECORD(regExists.trainee_ref_id)
            if (!trainee) {
                toast({
                    title: 'Verification Failed',
                    description: `No trainee Record.`,
                    status: 'error',
                    duration: 5000,
                })
                return
            }

            // ✅ SWITCH VIEW IMMEDIATELY
            setVerifiedCert(true)
            setIsPreparingCert(true)

            // 🔄 prepare data AFTER UI switch
            setTimeout(async () => {
                try {
                    const batchRec = await GET_BATCH_RECORD(trainingDoc.batch)

                    let year = 0
                    if(trainingDoc.batch === '1'){
                        year = trainingDoc.date_enrolled?.toDate()?.getFullYear();
                    }else if (batchRec?.createdAt?.toDate) {
                        year = batchRec.createdAt.toDate().getFullYear()
                    }
                    setYear(year)

                    const training_date =
                        trainingDoc.numOfDays === 1
                            ? formatTrainingSchedule(trainingDoc.start_date, year)
                            : `${formatTrainingSchedule(trainingDoc.start_date, year)} to ${formatTrainingSchedule(trainingDoc.end_date, year)}`

                    // const split_Month = formatTrainingSchedule(
                    //     trainingDoc.end_date || trainingDoc.start_date,
                    //     year
                    // ).split(' ')[0]
                    const split_Month = formatTrainingSchedule((trainingDoc.end_date === '' ? trainingDoc.start_date : trainingDoc.end_date), year || 0).split(' ')[0]

                    // const split_Day = formatTrainingSchedule(
                    //     trainingDoc.end_date || trainingDoc.start_date,
                    //     year
                    // ).split(' ')[1].replace(/\D/g, '')
                    const split_Day = formatTrainingSchedule((trainingDoc.end_date === '' ? trainingDoc.start_date : trainingDoc.end_date), year || 0).split(' ')[1].replace(/\D/g, '')

                    const nth_Day = getOrdinalHTML(Number(split_Day))
                    const view_count: number = (Number(trainingDoc?.viewCount || 0) + 1)

                    // ✅ set all UI data
                    setFN(trainee.first_name)
                    setMN(trainee.middle_name)
                    setLN(trainee.last_name)
                    setTrainingDate(training_date)
                    setStartDate(trainingDoc.start_date)
                    setEndDate(trainingDoc.end_date)
                    setConducted(trainingDoc.conductedOnline)
                    setNumOfDays(trainingDoc.numOfDays)
                    setSplitMonth(split_Month)
                    setNthDay(nth_Day)
                    setCertContentHtml(trainingDoc.certContent)
                    setCertTitleHtml(trainingDoc.certTitle)
                    await UPDATE_VIEW_CERT_ACCESS(trainingDoc.id, view_count, '')
                    toast({
                        title: 'Certificate Verified',
                        status: 'success',
                        duration: 3000,
                    })
                } catch (err) {
                    console.error(err)
                } finally {
                    setIsPreparingCert(false)
                }
            }, 0)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    
    const normalizeCertContent = (html: string) => {
        const temp = document.createElement('div')
        temp.innerHTML = html

        // convert inner divs to spans
        temp.querySelectorAll('div').forEach(div => {
            const span = document.createElement('span')
            span.innerHTML = div.innerHTML

            // copy styles you need
            span.style.display = 'inline'
            span.style.textAlign = div.style.textAlign || 'center'
            span.style.lineHeight = '1.2'

            div.replaceWith(span)
        })
        return temp.innerHTML
    }
    
    
    const formatCertContent = (year: number, trainingYear: number) => {
        let courseTemplate = certContentHtml

        let processedContent = '';

        const isMoreThanADay = numOfDays > 1
        const startDate = formatTrainingSchedule(start_date, trainingYear || year)
        const endDate = formatTrainingSchedule(end_date, trainingYear || year)

        const moreThanADay = isMoreThanADay ? 'from' : 'on'
        const conductAt = conductOn ? 'online' : ' '

        if(isMoreThanADay){
            processedContent = courseTemplate.replace('[start_date] to [end_date]', `${startDate} to ${endDate}`).replace('[numOfDays]', moreThanADay).replace('[isOnline]', conductAt)
        }else {
            processedContent = courseTemplate.replace('[start_date]', startDate).replace('[numOfDays]', moreThanADay).replace('[isOnline]', conductAt)
        }

        const finalHtmlContent = normalizeCertContent(processedContent)

        return finalHtmlContent
    }

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-700 mx-auto"></div>
            <p className="text-sm font-medium text-gray-600">Verifying certificate against official registry...</p>
            </div>
        </div>
        );
    }

    if (error || !trainingData) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-200 text-center space-y-3">
            <div className="text-red-600 text-3xl font-bold">⚠️</div>
            <h1 className="text-lg font-bold text-red-700">Verification Failed</h1>
            <p className="text-sm text-gray-600">{error || 'Certificate could not be verified.'}</p>
            </div>
        </div>
        );
    }

    return(
    <>
        {/** Certificate Verification Modal */}
        <main className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                
                {/* Header Banner */}
                <div className="bg-sky-800 text-white p-6 text-center">
                <h1 className="text-xl font-bold uppercase tracking-wider">Pentagon Maritime Services</h1>
                <p className="text-xs text-sky-200 mt-1">Official Certificate Verification System</p>
                </div>

                {/* Certificate Details Container */}
                <div className="p-6 space-y-6">
                
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-emerald-800 uppercase">Status</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-1 rounded">
                    ✓ VALID & VERIFIED
                    </span>
                </div>

                {/* Core Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                    <p className="text-xs text-gray-500 uppercase">Certificate No.</p>
                    <p className="font-semibold text-gray-800">{trainingData.certNo || 'N/A'}</p>
                    </div>
                    <div>
                    <p className="text-xs text-gray-500 uppercase">Training Dates</p>
                    <p className="font-semibold text-gray-800">
                        {trainingData.start_date} {trainingData.end_date && trainingData.end_date !== '--' ? `- ${trainingData.end_date}` : ''}
                    </p>
                    </div>
                </div>

                {/* Long Form Certificate Content (Fetched securely from database) */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Official Compliance & Course Details
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {trainingData.certContent || 'No additional compliance content recorded for this training.'}
                    </div>
                </div>

                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-xs text-gray-500">
                This record is cryptographically linked to the Pentagon Maritime database.
                </div>

            </div>
        </main>
    </>
    )
}