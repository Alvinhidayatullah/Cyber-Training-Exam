import React, { useState, useEffect, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';

// ======================== DATA SOAL ========================
const MASTER_QUESTIONS = [
    { "text": "Vulnerability yang memungkinkan attacker menjalankan script di browser korban disebut?", "correctAnswer": "C", "correctText": "XSS", "options": ["CSRF", "SQL Injection", "XSS", "SSRF"] },
    { "text": "Payload berikut termasuk jenis apa? <script>alert(1)</script>", "correctAnswer": "B", "correctText": "XSS", "options": ["RCE", "XSS", "LFI", "XXE"] },
    { "text": "SQL Injection biasanya terjadi karena?", "correctAnswer": "A", "correctText": "Input tidak divalidasi", "options": ["Input tidak divalidasi", "HTTPS aktif", "Firewall aktif", "DNS error"] },
    { "text": "Fungsi utama prepared statement adalah?", "correctAnswer": "B", "correctText": "Mencegah SQL Injection", "options": ["Mempercepat database", "Mencegah SQL Injection", "Menghapus log", "Bypass autentikasi"] },
    { "text": "Serangan CSRF memanfaatkan?", "correctAnswer": "A", "correctText": "Trust browser korban", "options": ["Trust browser korban", "Buffer overflow", "SQL syntax", "Port scanning"] },
    { "text": "Apa kepanjangan dari PKI?", "correctAnswer": "A", "correctText": "Public Key Infrastructure", "options": ["Public Key Infrastructure", "Private Key Interface", "Public Knowledge Integration", "Private Key Installation"] },
];

// ======================== MUSIC PLAYLIST ========================
const musicPlaylist = [
    "https://c.top4top.io/m_3791la5iu1.mp3",
    "https://d.top4top.io/m_3791wgjxn2.mp3",
    "https://e.top4top.io/m_3791mf0hv3.mp3",
    "https://k.top4top.io/m_3791lnhyo1.mp3",
    "https://l.top4top.io/m_37919ybf22.mp3",
    "https://b.top4top.io/m_3791kjno03.mp3",
    "https://c.top4top.io/m_3791p52bw4.mp3",
    "https://f.top4top.io/m_3791a0zge1.mp3",
    "https://g.top4top.io/m_3791mf4c32.mp3",
    "https://h.top4top.io/m_379112fuk3.mp3"
];

const shuffleArray = (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const cleanPrefix = (text) => {
    if (!text) return '';
    return text.replace(/^[A-D]\.\s*/, '');
};

const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
};

function App() {
    const [screen, setScreen] = useState('start');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120 * 60);
    const [isMuted, setIsMuted] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [tempMessage, setTempMessage] = useState(null);
    
    const audioRef = useRef(null);
    const timerRef = useRef(null);
    const currentPlaylistRef = useRef([]);
    const currentTrackIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    
    // Helper functions
    const shuffleOptions = (question) => {
        const options = [...question.options];
        const correctTextValue = question.correctText;
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        let newCorrectLetter = "";
        for (let i = 0; i < options.length; i++) {
            if (options[i] === correctTextValue || options[i].includes(correctTextValue)) {
                newCorrectLetter = String.fromCharCode(65 + i);
                break;
            }
        }
        return { shuffledOptions: options, newAnswer: newCorrectLetter };
    };
    
    const calculatePercentageScore = useCallback(() => {
        if (questions.length === 0) return 0;
        let correct = 0;
        for (let i = 0; i < questions.length; i++) {
            if (questions[i]._userAnswer && questions[i]._userAnswer === questions[i]._shuffledData.newAnswer) {
                correct++;
            }
        }
        return Math.round((correct / questions.length) * 100 * 10) / 10;
    }, [questions]);
    
    const finalizeExam = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setScreen('thankyou');
    }, []);
    
    // Music functions
    const initNewPlaylist = useCallback(() => {
        currentPlaylistRef.current = shuffleArray([...musicPlaylist]);
        currentTrackIndexRef.current = 0;
    }, []);
    
    const playCurrentTrack = useCallback(() => {
        if (!audioRef.current || currentPlaylistRef.current.length === 0) return;
        const trackSrc = currentPlaylistRef.current[currentTrackIndexRef.current];
        audioRef.current.src = trackSrc;
        if (!isMuted) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlayingRef.current = true;
                }).catch(err => console.log("Play error:", err));
            }
        }
    }, [isMuted]);
    
    const playNextTrack = useCallback(() => {
        if (!audioRef.current) return;
        currentTrackIndexRef.current++;
        if (currentTrackIndexRef.current >= currentPlaylistRef.current.length) {
            initNewPlaylist();
        }
        playCurrentTrack();
    }, [initNewPlaylist, playCurrentTrack]);
    
    const toggleMute = useCallback(() => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = 0.4;
                audioRef.current.play().then(() => {
                    isPlayingRef.current = true;
                }).catch(e => console.log("Playback error:", e));
                setIsMuted(false);
            } else {
                audioRef.current.pause();
                isPlayingRef.current = false;
                setIsMuted(true);
            }
        }
    }, [isMuted]);
    
    // Timer effect
    useEffect(() => {
        if (screen === 'exam' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                        finalizeExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            };
        }
    }, [screen, timeLeft, finalizeExam]);
    
    // Start exam
    const startExam = useCallback(() => {
        const shuffled = shuffleArray([...MASTER_QUESTIONS]);
        const processedQuestions = shuffled.map(q => ({
            ...q,
            _shuffledData: shuffleOptions(q),
            _userAnswer: null
        }));
        
        setQuestions(processedQuestions);
        setCurrentIndex(0);
        setTimeLeft(120 * 60);
        setScreen('exam');
    }, []);
    
    const handleAnswer = useCallback((letter) => {
        setQuestions(prev => {
            const updated = [...prev];
            updated[currentIndex] = {
                ...updated[currentIndex],
                _userAnswer: letter
            };
            return updated;
        });
    }, [currentIndex]);
    
    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            setTempMessage({ msg: "📌 Ini soal pertama", color: "#f0f" });
            setTimeout(() => setTempMessage(null), 1800);
        }
    }, [currentIndex]);
    
    const goNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setTempMessage({ msg: "📌 Soal terakhir, klik SELESAI", color: "#0ff" });
            setTimeout(() => setTempMessage(null), 1800);
        }
    }, [currentIndex, questions.length]);
    
    const finishExam = useCallback(async () => {
        const result = await Swal.fire({
            title: '⚠️ SELESAI UJIAN?',
            text: "Semua jawaban akan dinilai dan sesi diakhiri. Anda yakin?",
            icon: 'question',
            background: '#0a0f1f',
            color: '#0ff',
            confirmButtonColor: '#f0f',
            cancelButtonColor: '#0ff',
            confirmButtonText: 'YA, SELESAI!',
            cancelButtonText: 'BATAL',
            showCancelButton: true,
        });
        if (result.isConfirmed) {
            finalizeExam();
        }
    }, [finalizeExam]);
    
    const restartExam = useCallback(() => {
        setScreen('start');
        setQuestions([]);
        setCurrentIndex(0);
        setShowResult(false);
        setTimeLeft(120 * 60);
    }, []);
    
    // Init audio
    useEffect(() => {
        const audio = new Audio();
        audio.volume = 0.4;
        audio.loop = false;
        audio.addEventListener('ended', playNextTrack);
        audio.addEventListener('error', playNextTrack);
        audioRef.current = audio;
        initNewPlaylist();
        
        // Start music after a short delay
        setTimeout(() => {
            if (audioRef.current && !isMuted) {
                playCurrentTrack();
            }
        }, 500);
        
        // Auto-play attempt on user interaction
        const tryAutoplay = () => {
            if (audioRef.current && !isMuted && !isPlayingRef.current) {
                audioRef.current.play().then(() => {
                    isPlayingRef.current = true;
                }).catch(e => console.log("Autoplay blocked, need user interaction"));
            }
            document.removeEventListener('click', tryAutoplay);
            document.removeEventListener('touchstart', tryAutoplay);
        };
        document.addEventListener('click', tryAutoplay);
        document.addEventListener('touchstart', tryAutoplay);
        
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('ended', playNextTrack);
                audioRef.current.removeEventListener('error', playNextTrack);
            }
            document.removeEventListener('click', tryAutoplay);
            document.removeEventListener('touchstart', tryAutoplay);
        };
    }, []);
    
    const formatTime = (sec) => {
        const mins = Math.floor(sec / 60);
        const s = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    
    const answeredCount = questions.filter(q => q._userAnswer !== null).length;
    const percentageScore = calculatePercentageScore();
    
    // Mute Button Component
    const MuteButton = () => (
        <button
            onClick={toggleMute}
            className="fixed top-5 left-5 z-[100] bg-gray-900/90 backdrop-blur-xl border-2 border-cyan-400 rounded-full px-4 py-2 font-mono font-bold text-cyan-400 flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 hover:border-fuchsia-500 hover:text-fuchsia-500 active:scale-95"
        >
            {isMuted ? '🔇 MUSIC OFF' : '🔊 MUSIC ON'}
        </button>
    );
    
    // Temp Message Component
    const TempMessage = () => {
        if (!tempMessage) return null;
        return (
            <div 
                className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/80 border rounded-full px-4 py-2 text-sm font-mono font-bold z-[999]"
                style={{ borderColor: tempMessage.color, color: tempMessage.color }}
            >
                {tempMessage.msg}
            </div>
        );
    };
    
    // Start Screen
    if (screen === 'start') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative">
                <MuteButton />
                <div className="cyber-card max-w-2xl w-full text-center relative z-10">
                    <div className="text-4xl md:text-6xl font-extrabold uppercase text-cyan-400 animate-flicker whitespace-nowrap md:whitespace-normal">
                        CYBER TRAINING
                    </div>
                    <div className="flex justify-center gap-3 my-4 flex-wrap">
                        <span className="inline-flex bg-cyan-400/10 border-l-4 border-cyan-400 px-4 py-2 font-bold text-cyan-400 text-sm">⚡ DAK</span>
                        <span className="inline-flex bg-cyan-400/10 border-l-4 border-cyan-400 px-4 py-2 font-bold text-cyan-400 text-sm">⚡ SISOS</span>
                        <span className="inline-flex bg-cyan-400/10 border-l-4 border-cyan-400 px-4 py-2 font-bold text-cyan-400 text-sm">⚡ KAL</span>
                    </div>
                    <p className="text-blue-300">{MASTER_QUESTIONS.length} Soal Keamanan Siber | 120 Menit</p>
                    <p className="text-cyan-400/60 text-sm mt-2">⟡ Waktu Berjalan Setelah Mulai ⟡</p>
                    <button onClick={startExam} className="btn-cyber">⟢ MULAI UJIAN ⟣</button>
                    <div className="text-gray-500 text-xs mt-6">© Cyber Training 2026 | Vinnzz</div>
                </div>
                <TempMessage />
            </div>
        );
    }
    
    // Exam Screen
    if (screen === 'exam' && questions.length > 0) {
        const q = questions[currentIndex];
        const shuffledData = q._shuffledData;
        const selectedVal = q._userAnswer;
        const category = ["DAK", "KAL", "SISOS"][currentIndex % 3];
        
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative">
                <MuteButton />
                <div className="cyber-card max-w-3xl w-full relative z-10">
                    <div className="flex justify-between items-center flex-wrap gap-3 bg-blue-950/30 px-5 py-2 rounded-full border border-cyan-400 mb-7">
                        <div className="timer-neon">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-cyan-400 bg-gray-800/50 px-4 py-1 rounded-full text-sm border border-cyan-400">
                            Soal {currentIndex + 1} / {questions.length} | ✓ {answeredCount} terjawab
                        </div>
                    </div>
                    
                    <div className="inline-block bg-cyan-400/20 px-4 py-1 rounded-full text-cyan-400 border border-cyan-400 text-xs mb-4">
                        [{category}] Soal {currentIndex + 1} / {questions.length}
                    </div>
                    
                    <div className="text-xl md:text-2xl font-semibold text-white my-5 leading-relaxed">
                        {escapeHtml(q.text)}
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-2">
                        {shuffledData.shuffledOptions.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const cleanOpt = cleanPrefix(opt);
                            return (
                                <label key={idx} className="opt-item cursor-pointer">
                                    <input
                                        type="radio"
                                        name="question"
                                        value={letter}
                                        checked={selectedVal === letter}
                                        onChange={() => handleAnswer(letter)}
                                        className="w-4 h-4 accent-cyan-400 cursor-pointer"
                                    />
                                    <span className="text-gray-300 text-sm md:text-base">{letter}. {cleanOpt}</span>
                                </label>
                            );
                        })}
                    </div>
                    
                    <div className="flex gap-2 mt-8 flex-wrap">
                        <button onClick={goPrev} className="nav-btn">◀ SEBELUM</button>
                        <button onClick={goNext} className="nav-btn">BERIKUT ▶</button>
                        <button onClick={finishExam} className="nav-btn border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black">✔ SELESAI</button>
                    </div>
                    
                    <div className="text-gray-500 text-xs text-center mt-6"># Jawaban Akan Tersimpan Secara Otomatis</div>
                </div>
                <TempMessage />
            </div>
        );
    }
    
    // Thank You Screen
    let message = "";
    if (percentageScore === 100) message = "🏆 SEMPURNA! Anda Hebat! 🏆";
    else if (percentageScore >= 85) message = "🏅 LUAR BIASA! Anda menguasai materi! 🏅";
    else if (percentageScore >= 70) message = "🔥 SANGAT BAIK! Pertahankan! 🔥";
    else if (percentageScore >= 60) message = "✨ CUKUP BAIK, tingkatkan lagi! ✨";
    else if (percentageScore >= 50) message = "📚 Belajar lagi, Anda pasti bisa! 📚";
    else message = "💪 Jangan menyerah! Pelajari ulang dan coba lagi! 💪";
    
    // Result Modal
    const ResultModal = () => {
        if (!showResult) return null;
        
        return (
            <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[2000] flex items-center justify-center p-4">
                <div className="bg-gray-900 border-2 border-cyan-400 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-cyan-400 text-center sticky top-0 bg-gray-900 rounded-t-3xl">
                        <h3 className="text-cyan-400 text-2xl font-bold">📋 KUNCI JAWABAN & HASIL ANDA</h3>
                        <div className="text-green-500 text-xl mt-2">✨ SKOR: {percentageScore} / 100 ✨</div>
                    </div>
                    <div className="overflow-y-auto p-6 flex-1">
                        {questions.map((q, i) => {
                            const shuffledData = q._shuffledData;
                            const userAnswerLetter = q._userAnswer;
                            const correctLetter = shuffledData.newAnswer;
                            const isCorrect = userAnswerLetter === correctLetter;
                            
                            let userAnswerDisplay = "Tidak dijawab";
                            if (userAnswerLetter) {
                                const idx = userAnswerLetter.charCodeAt(0) - 65;
                                const rawAnswerText = shuffledData.shuffledOptions[idx];
                                userAnswerDisplay = `${userAnswerLetter}. ${cleanPrefix(rawAnswerText)}`;
                            }
                            
                            const correctIdx = correctLetter.charCodeAt(0) - 65;
                            const correctAnswerDisplay = `${correctLetter}. ${cleanPrefix(shuffledData.shuffledOptions[correctIdx])}`;
                            
                            return (
                                <div key={i} className={`rounded-2xl p-3 mb-3 ${isCorrect ? 'border-l-4 border-green-500 bg-green-950/30' : 'border-l-4 border-fuchsia-500 bg-fuchsia-950/30'}`}>
                                    <div className="text-gray-200 text-sm"><strong>Soal {i+1}:</strong> {escapeHtml(q.text)}</div>
                                    <div className="text-gray-400 text-xs mt-1">📌 <span className="text-cyan-400">Jawaban Anda:</span> {userAnswerDisplay}</div>
                                    <div className="text-gray-400 text-xs">✅ <span className="text-cyan-400">Jawaban Benar:</span> {correctAnswerDisplay}</div>
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={() => setShowResult(false)} className="bg-gray-900 border-2 border-cyan-400 text-cyan-400 py-3 px-6 rounded-full font-bold font-mono cursor-pointer mx-6 mb-6 transition-all duration-200 hover:bg-cyan-400 hover:text-black">
                        TUTUP
                    </button>
                </div>
            </div>
        );
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <MuteButton />
            <div className="cyber-card max-w-2xl w-full text-center relative z-10">
                <div className="text-3xl md:text-4xl font-bold uppercase text-cyan-400 animate-flicker">⚡ TERIMA KASIH ⚡</div>
                <p className="text-cyan-200 mt-2">Telah Mengikuti Pelatihan Ujian Siber</p>
                <div className="text-5xl md:text-6xl font-extrabold text-green-500 bg-black/50 inline-block px-6 py-2 rounded-full my-5">
                    {percentageScore} / 100
                </div>
                <div className="text-fuchsia-400 my-4">
                    ✨ Nilai Anda: {percentageScore} dari 100 ✨<br />{message}
                </div>
                <button onClick={() => setShowResult(true)} className="btn-cyber mt-4">📋 LIHAT KUNCI JAWABAN</button>
                <button onClick={restartExam} className="btn-cyber mt-3">⟳ KERJAKAN ULANG</button>
                <div className="text-gray-500 text-xs mt-6">© Cyber Training 2026</div>
            </div>
            <ResultModal />
            <TempMessage />
        </div>
    );
}

export default App;
