import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Activity, 
  Scale, 
  Plus, 
  Minus, 
  Check, 
  TrendingDown, 
  Clock, 
  Upload, 
  CloudLightning, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Dumbbell, 
  Sparkles, 
  RefreshCw, 
  User, 
  Lock, 
  Info,
  Award
} from 'lucide-react';
import { EXERCISES, CATEGORIES } from './data/exercises';
import './App.css';

// Custom YouTube Icon SVG
const Youtube = ({ size = 16, ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    {...props}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);


function App() {
  // --- Persistent State ---
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('steelsync_workouts');
    return saved ? JSON.parse(saved) : [];
  });

  const [weightHistory, setWeightHistory] = useState(() => {
    const saved = localStorage.getItem('steelsync_weight_history');
    if (saved) return JSON.parse(saved);
    // Seed default weight history for visualization
    const seed = [
      { date: '2026-05-20', weight: 70.2, bodyFat: 15.4, source: 'eufylife_csv' },
      { date: '2026-05-22', weight: 69.8, bodyFat: 15.2, source: 'eufylife_csv' },
      { date: '2026-05-24', weight: 69.5, bodyFat: 15.0, source: 'eufylife_csv' },
      { date: '2026-05-26', weight: 69.1, bodyFat: 14.8, source: 'eufylife_csv' },
      { date: '2026-05-28', weight: 68.8, bodyFat: 14.7, source: 'eufylife_csv' },
    ];
    localStorage.setItem('steelsync_weight_history', JSON.stringify(seed));
    return seed;
  });

  // --- Session Timer State ---
  const [isSessionActive, setIsSessionActive] = useState(() => {
    return localStorage.getItem('steelsync_session_active') === 'true';
  });
  const [sessionStartTime, setSessionStartTime] = useState(() => {
    const saved = localStorage.getItem('steelsync_session_start_time');
    return saved ? parseInt(saved, 10) : null;
  });
  const [sessionElapsed, setSessionElapsed] = useState(0);

  // --- UI Navigation State ---
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'logger' | 'calendar' | 'weight'
  
  // --- Workout Logger Form State ---
  const [logStep, setLogStep] = useState(1); // 1: Category, 2: Exercise, 3: Sets Logger
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sessionLoggedExercises, setSessionLoggedExercises] = useState([]); // Temporary exercise logs during current active session
  
  // Steppers State
  const [stepperWeight, setStepperWeight] = useState(40.0);
  const [stepperReps, setStepperReps] = useState(10);
  const [currentLoggedSets, setCurrentLoggedSets] = useState([]); // Sets logged for the *current* exercise screen

  // --- Calendar state ---
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState(null); // Workouts logged on selected day

  // --- EufyLife Weight Sync Form State ---
  const [eufyEmail, setEufyEmail] = useState('');
  const [eufyPassword, setEufyPassword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');

  // --- Toast/Notification State ---
  const [toastMessage, setToastMessage] = useState('');

  // --- Helper References ---
  const csvInputRef = useRef(null);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('steelsync_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('steelsync_weight_history', JSON.stringify(weightHistory));
  }, [weightHistory]);

  // Session timer ticker
  useEffect(() => {
    let interval = null;
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setSessionElapsed(elapsed);
      }, 1000);
    } else {
      setSessionElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  // Get current weight
  const getCurrentWeight = () => {
    if (weightHistory.length === 0) return 65.0; // fallback
    const sorted = [...weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].weight;
  };

  // Get Today's String
  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  // Show Toast Utility
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- Timer Actions ---
  const startWorkoutSession = () => {
    const startTime = Date.now();
    setIsSessionActive(true);
    setSessionStartTime(startTime);
    localStorage.setItem('steelsync_session_active', 'true');
    localStorage.setItem('steelsync_session_start_time', startTime.toString());
    setSessionLoggedExercises([]);
    triggerToast("ワークアウトセッションを開始しました！");
  };

  const finishWorkoutSession = () => {
    if (sessionLoggedExercises.length === 0) {
      // Prompt confirm if nothing was logged
      const confirmEnd = window.confirm("ワークアウトが記録されていません。セッションを終了しますか？");
      if (!confirmEnd) return;
    } else {
      // Save all session workouts to main workouts list
      setWorkouts(prev => [...prev, ...sessionLoggedExercises]);
      triggerToast("ワークアウトを保存しました！お疲れ様でした！");
    }

    // Reset session states
    setIsSessionActive(false);
    setSessionStartTime(null);
    localStorage.removeItem('steelsync_session_active');
    localStorage.removeItem('steelsync_session_start_time');
    setSessionLoggedExercises([]);
    setCurrentTab('dashboard');
  };

  // --- Calorie Calculator (METs Based) ---
  const calculateCalories = (exerciseMets, setsCount) => {
    const weight = getCurrentWeight();
    // Assuming each set + rest takes roughly 2 minutes (2/60 hours)
    const durationHours = (setsCount * 2) / 60;
    const calories = exerciseMets * weight * durationHours;
    return Math.round(calories);
  };

  // Calculate today's total calories
  const getTodayCalories = () => {
    const today = getTodayString();
    // Combined finished workouts + current active session logs
    const completedCalories = workouts
      .filter(w => w.date === today)
      .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    const activeSessionCalories = sessionLoggedExercises
      .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    return completedCalories + activeSessionCalories;
  };

  // Calculate today's sets
  const getTodaySetsCount = () => {
    const today = getTodayString();
    const completedSets = workouts
      .filter(w => w.date === today)
      .reduce((sum, w) => sum + w.sets.length, 0);

    const activeSets = sessionLoggedExercises
      .reduce((sum, w) => sum + w.sets.length, 0);

    return completedSets + activeSets;
  };

  // --- Logging Exercise Actions ---
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setLogStep(2);
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    
    // Set default stepper values based on exercise
    if (exercise.equipment === 'Dumbbell') {
      setStepperWeight(10.0);
    } else {
      setStepperWeight(40.0);
    }
    setStepperReps(10);
    setCurrentLoggedSets([]);
    setLogStep(3);
  };

  // Add individual set
  const addSet = () => {
    const newSet = {
      setNum: currentLoggedSets.length + 1,
      weight: stepperWeight,
      reps: stepperReps
    };
    setCurrentLoggedSets(prev => [...prev, newSet]);
    triggerToast(`Set ${newSet.setNum} を追加しました`);
  };

  const removeSet = (index) => {
    setCurrentLoggedSets(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Remap set numbers
      return updated.map((s, idx) => ({ ...s, setNum: idx + 1 }));
    });
  };

  const saveExerciseWorkout = () => {
    if (currentLoggedSets.length === 0) {
      alert("セットを1つ以上追加してください。");
      return;
    }

    const today = getTodayString();
    const cals = calculateCalories(selectedExercise.mets, currentLoggedSets.length);

    const newWorkoutLog = {
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: today,
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      category: selectedExercise.category,
      equipment: selectedExercise.equipment,
      sets: currentLoggedSets,
      mets: selectedExercise.mets,
      caloriesBurned: cals
    };

    if (isSessionActive) {
      // Add to current session cache
      setSessionLoggedExercises(prev => [...prev, newWorkoutLog]);
      triggerToast(`${selectedExercise.name}をセッションに追加しました`);
    } else {
      // Add directly to permanent storage (quick log outside session)
      setWorkouts(prev => [...prev, newWorkoutLog]);
      triggerToast(`${selectedExercise.name}を記録しました！`);
    }

    // Reset logger state
    setLogStep(1);
    setSelectedExercise(null);
    setSelectedCategory('');
    setCurrentTab('dashboard');
  };

  // Delete workout entry from calendar
  const deleteWorkout = (workoutId) => {
    if (window.confirm("このトレーニング記録を削除しますか？")) {
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      setSelectedDayWorkouts(prev => prev ? prev.filter(w => w.id !== workoutId) : null);
      triggerToast("記録を削除しました");
    }
  };

  // --- EufyLife Weight Sync Logic ---
  const handleCloudSync = (e) => {
    e.preventDefault();
    if (!eufyEmail || !eufyPassword) {
      alert("メールアドレスとパスワードを入力してください。");
      return;
    }

    setSyncing(true);

    // Simulate network delay for sync
    setTimeout(() => {
      setSyncing(false);
      
      // Calculate a randomized weight slightly fluctuating from the last logged weight
      const lastWeight = getCurrentWeight();
      const change = (Math.random() * 0.6 - 0.3); // fluctuates +/- 0.3kg
      const newWeight = Math.round((lastWeight + change) * 10) / 10;
      const today = getTodayString();

      const newEntry = {
        date: today,
        weight: newWeight,
        bodyFat: Math.round((14.5 + Math.random() * 0.4) * 10) / 10,
        source: 'eufylife_cloud'
      };

      // Add or replace weight for today
      setWeightHistory(prev => {
        const filtered = prev.filter(w => w.date !== today);
        return [...filtered, newEntry];
      });

      triggerToast(`EufyLifeから最新の体重データ (${newWeight} kg) を同期しました！`);
      setEufyEmail('');
      setEufyPassword('');
    }, 2000);
  };

  // Parses EufyLife CSV data
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        if (lines.length < 2) {
          throw new Error('CSVファイルが空か、正しいフォーマットではありません。');
        }

        // Detect headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('time') || h.includes('日付') || h.includes('時間'));
        const weightIndex = headers.findIndex(h => h.includes('weight') || h.includes('体重'));
        const fatIndex = headers.findIndex(h => h.includes('fat') || h.includes('体脂肪'));

        if (dateIndex === -1 || weightIndex === -1) {
          throw new Error('CSVヘッダーに「日付」や「体重」に該当する列が見つかりません。');
        }

        const parsedEntries = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(',');
          if (cols.length <= Math.max(dateIndex, weightIndex)) continue;

          const dateStr = cols[dateIndex].trim();
          const weightVal = parseFloat(cols[weightIndex].trim());
          const fatVal = fatIndex !== -1 ? parseFloat(cols[fatIndex].trim()) : null;

          if (dateStr && !isNaN(weightVal)) {
            // Clean date: support YYYY/MM/DD HH:mm -> YYYY-MM-DD
            const cleanDate = dateStr.split(' ')[0].replace(/\//g, '-');
            parsedEntries.push({
              date: cleanDate,
              weight: weightVal,
              bodyFat: isNaN(fatVal) ? null : fatVal,
              source: 'eufylife_csv'
            });
          }
        }

        if (parsedEntries.length === 0) {
          throw new Error('有効なデータ行がありませんでした。');
        }

        // Merge keeping latest weights for overlapping dates
        setWeightHistory(prev => {
          const merged = [...prev];
          parsedEntries.forEach(newEntry => {
            const index = merged.findIndex(w => w.date === newEntry.date);
            if (index !== -1) {
              // Replace older record with CSV record
              merged[index] = newEntry;
            } else {
              merged.push(newEntry);
            }
          });
          return merged.sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        setCsvSuccess(`${parsedEntries.length}件の体重データをEufyLife CSVからインポートしました！`);
        setCsvError('');
        triggerToast("EufyLifeデータをインポートしました！");
      } catch (err) {
        setCsvError(err.message || 'CSVの解析に失敗しました。');
        setCsvSuccess('');
      }
    };
    reader.readAsText(file);
  };

  // Generate Sample EufyLife CSV for testing
  const downloadSampleCSV = () => {
    const csvContent = 
      "測定時間,体重(kg),体脂肪率(%)\n" +
      "2026/05/24 07:30,69.5,15.0\n" +
      "2026/05/25 07:15,69.3,14.9\n" +
      "2026/05/26 07:45,69.1,14.8\n" +
      "2026/05/27 08:00,69.0,14.8\n" +
      "2026/05/28 07:20,68.8,14.7\n" +
      "2026/05/29 07:30,68.5,14.5\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "EufyLife_sample_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("サンプルCSVをダウンロードしました");
  };

  // --- Rendering Functions ---

  // Header Bar
  const renderHeader = () => (
    <header className="app-header">
      <div className="app-title">
        <Dumbbell className="text-primary" size={24} style={{ transform: 'rotate(-45deg)' }} />
        <span>SteelSync</span>
      </div>
      {isSessionActive && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 23, 68, 0.1)',
          border: '1px solid rgba(255, 23, 68, 0.2)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--danger-color)'
        }}>
          <Clock size={12} className="animate-pulse" />
          <span>
            {Math.floor(sessionElapsed / 3600).toString().padStart(2, '0')}:
            {Math.floor((sessionElapsed % 3600) / 60).toString().padStart(2, '0')}:
            {(sessionElapsed % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}
    </header>
  );

  // Bottom Navigation Bar
  const renderBottomNav = () => (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setCurrentTab('dashboard')}
      >
        <Activity />
        <span>ホーム</span>
      </button>
      <button 
        className={`nav-item ${currentTab === 'logger' ? 'active' : ''}`}
        onClick={() => {
          setCurrentTab('logger');
          setLogStep(1);
          setSelectedExercise(null);
        }}
      >
        <Plus />
        <span>記録</span>
      </button>
      <button 
        className={`nav-item ${currentTab === 'calendar' ? 'active' : ''}`}
        onClick={() => {
          setCurrentTab('calendar');
          setSelectedDayWorkouts(null);
        }}
      >
        <CalendarIcon />
        <span>カレンダー</span>
      </button>
      <button 
        className={`nav-item ${currentTab === 'weight' ? 'active' : ''}`}
        onClick={() => setCurrentTab('weight')}
      >
        <Scale />
        <span>体重同期</span>
      </button>
    </nav>
  );

  // Tab 1: Dashboard View
  const renderDashboard = () => {
    const today = getTodayString();
    
    // Workouts logged today (either stored or active session)
    const todayWorkouts = [
      ...workouts.filter(w => w.date === today),
      ...sessionLoggedExercises
    ];

    return (
      <div className="app-content animate-fade-in">
        {/* Welcome Section */}
        <div style={{ marginBottom: '4px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>記録ダッシュボード</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>本日もトレーニングを始めましょう！</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>本日消費カロリー (概算)</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-color)', textShadow: '0 0 10px var(--primary-glow)' }}>
              {getTodayCalories()} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kcal</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              METs × 体重 × 時間
            </span>
          </div>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>総セット数</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary-color)', textShadow: '0 0 10px var(--secondary-glow)' }}>
              {getTodaySetsCount()} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>sets</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              本日こなした合計セット
            </span>
          </div>
        </div>

        {/* EufyLife Weight Quick View */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>最新の同期体重 (EufyLife)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{getCurrentWeight()}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>kg</span>
            </div>
          </div>
          <button 
            className="btn-secondary" 
            style={{ width: 'auto', height: '36px', padding: '0 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
            onClick={() => setCurrentTab('weight')}
          >
            <RefreshCw size={14} style={{ marginRight: '4px' }} />
            同期画面へ
          </button>
        </div>

        {/* Active Session Status Card */}
        <div className="glass-card" style={{ 
          borderLeft: isSessionActive ? '4px solid var(--danger-color)' : '1px solid var(--border-color)',
          background: isSessionActive ? 'linear-gradient(to right, rgba(255, 23, 68, 0.05), var(--surface-color))' : 'var(--surface-color)'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isSessionActive ? (
              <>
                <Clock className="text-danger animate-pulse" size={18} />
                <span>トレーニング中</span>
              </>
            ) : (
              <>
                <Sparkles className="text-primary" size={18} />
                <span>トレーニングを開始する</span>
              </>
            )}
          </h3>

          {isSessionActive ? (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                現在セッションがアクティブです。種目を選んでセットを追加してください。
              </p>
              
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => {
                    setCurrentTab('logger');
                    setLogStep(1);
                  }}
                >
                  <Plus size={18} /> 種目を追加
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, borderColor: 'var(--danger-color)', color: 'var(--danger-color)', background: 'rgba(255, 23, 68, 0.05)' }}
                  onClick={finishWorkoutSession}
                >
                  <Check size={18} /> 終了する
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                セッションを開始するとタイマーが動き出し、消費カロリーをリアルタイムで計測・記録します。
              </p>
              <button className="btn-primary" onClick={startWorkoutSession}>
                <Dumbbell size={18} style={{ transform: 'rotate(-45deg)' }} /> セッション開始
              </button>
            </div>
          )}
        </div>

        {/* Today's Workout Summary */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award className="text-secondary" size={18} />
            <span>本日のトレーニングメニュー</span>
          </h3>

          {todayWorkouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <Dumbbell size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.875rem' }}>本日記録された種目はまだありません。</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayWorkouts.map((w, idx) => (
                <div key={w.id || idx} style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{w.exerciseName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', background: 'rgba(0, 229, 255, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      {w.caloriesBurned} kcal
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {w.sets.map((s, sIdx) => (
                      <span key={sIdx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                        {s.weight}kg × {s.reps}回
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tab 2: Workout Logger View (Step-by-step logger flow)
  const renderLogger = () => {
    return (
      <div className="app-content animate-fade-in">
        {logStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>部位を選択</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>鍛える筋肉の部位を選択してください。</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className="glass-card"
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '24px 12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>
                    {cat.includes('胸') && '💪'}
                    {cat.includes('背中') && '🦅'}
                    {cat.includes('脚') && '🦵'}
                    {cat.includes('肩') && '🛡️'}
                    {cat.includes('腕') && '⚡'}
                    {cat.includes('臀部') && '🍑'}
                  </span>
                  <span>{cat.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {logStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="stepper-btn" 
                style={{ width: '36px', height: '36px', fontSize: '1.2rem' }}
                onClick={() => setLogStep(1)}
              >
                ←
              </button>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>種目を選択</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{selectedCategory} のメニュー</p>
              </div>
            </div>

            {/* Exercises List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {EXERCISES.filter(ex => ex.category === selectedCategory).map((ex) => (
                <div 
                  key={ex.id} 
                  className="glass-card"
                  onClick={() => handleSelectExercise(ex)}
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'between', 
                    alignItems: 'center',
                    border: ex.isBig3 ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid var(--border-color)',
                    background: ex.isBig3 ? 'linear-gradient(to right, rgba(0, 229, 255, 0.03), var(--surface-color))' : 'var(--surface-color)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{ex.name}</span>
                      {ex.isBig3 && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          color: 'var(--primary-color)', 
                          border: '1px solid var(--primary-color)', 
                          padding: '1px 5px', 
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          BIG 3
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      器具: {ex.equipment === 'Smith Machine' ? 'スミスマシン' : 'ダンベル'}
                    </span>
                  </div>
                  <span style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }}>→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {logStep === 3 && selectedExercise && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* Header / Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="stepper-btn" 
                style={{ width: '36px', height: '36px', fontSize: '1.2rem' }}
                onClick={() => setLogStep(2)}
              >
                ←
              </button>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedExercise.name}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {selectedExercise.equipment === 'Smith Machine' ? 'スミスマシン' : 'ダンベル'} | METs: {selectedExercise.mets}
                </span>
              </div>
            </div>

            {/* YouTube Tutorial Link */}
            <div>
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedExercise.videoQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="youtube-link"
              >
                <Youtube size={16} />
                <span>YouTubeでフォーム動画を検索</span>
              </a>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {selectedExercise.description}
              </p>
            </div>

            {/* Custom Weight Numeric Stepper */}
            <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>負荷 (重量)</span>
              
              <div className="stepper-container">
                <button 
                  className="stepper-btn"
                  onClick={() => setStepperWeight(w => Math.max(0, w - 2.5))}
                >
                  -
                </button>
                <div>
                  <div className="stepper-value">{stepperWeight.toFixed(1)}</div>
                  <div className="stepper-label">kg</div>
                </div>
                <button 
                  className="stepper-btn"
                  onClick={() => setStepperWeight(w => w + 2.5)}
                >
                  +
                </button>
              </div>

              {/* Weight Quick Buttons */}
              <div className="quick-options">
                {selectedExercise.equipment === 'Dumbbell' ? (
                  [5.0, 7.5, 10.0, 12.5, 15.0, 20.0].map(val => (
                    <button 
                      key={val}
                      className={`quick-option-btn ${stepperWeight === val ? 'selected' : ''}`}
                      onClick={() => setStepperWeight(val)}
                    >
                      {val}kg
                    </button>
                  ))
                ) : (
                  [20.0, 40.0, 60.0, 80.0, 100.0, 120.0].map(val => (
                    <button 
                      key={val}
                      className={`quick-option-btn ${stepperWeight === val ? 'selected' : ''}`}
                      onClick={() => setStepperWeight(val)}
                    >
                      {val}kg
                    </button>
                  ))
                )}
              </div>
              
              {/* Core Stepper Increments */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="quick-option-btn" onClick={() => setStepperWeight(w => Math.max(0, w - 10))}>-10kg</button>
                <button className="quick-option-btn" onClick={() => setStepperWeight(w => Math.max(0, w - 1))}>-1kg</button>
                <button className="quick-option-btn" onClick={() => setStepperWeight(w => w + 1)}>+1kg</button>
                <button className="quick-option-btn" onClick={() => setStepperWeight(w => w + 10)}>+10kg</button>
              </div>
            </div>

            {/* Custom Reps Numeric Stepper */}
            <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>回数 (レップ数)</span>
              
              <div className="stepper-container">
                <button 
                  className="stepper-btn"
                  onClick={() => setStepperReps(r => Math.max(1, r - 1))}
                >
                  -
                </button>
                <div>
                  <div className="stepper-value">{stepperReps}</div>
                  <div className="stepper-label">reps</div>
                </div>
                <button 
                  className="stepper-btn"
                  onClick={() => setStepperReps(r => r + 1)}
                >
                  +
                </button>
              </div>

              {/* Reps Quick Buttons */}
              <div className="quick-options">
                {[5, 8, 10, 12, 15, 20].map(val => (
                  <button 
                    key={val}
                    className={`quick-option-btn ${stepperReps === val ? 'selected' : ''}`}
                    onClick={() => setStepperReps(val)}
                  >
                    {val}回
                  </button>
                ))}
              </div>
            </div>

            {/* Add Set Button */}
            <button className="btn-primary" onClick={addSet}>
              <Plus size={18} /> セットを記録
            </button>

            {/* Current Logged Sets List */}
            <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                記録されたセット
              </span>

              {currentLoggedSets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  セットがまだありません。上のボタンから追加してください。
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentLoggedSets.map((s, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px'
                    }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Set {s.setNum}</span>
                      <span style={{ fontSize: '0.9rem' }}>{s.weight} kg × {s.reps} 回</span>
                      <button 
                        onClick={() => removeSet(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Exercise Workout Button */}
            <button 
              className="btn-primary" 
              style={{ background: 'var(--success-color)', boxShadow: '0 4px 20px var(--success-glow)' }}
              onClick={saveExerciseWorkout}
              disabled={currentLoggedSets.length === 0}
            >
              <Check size={18} /> トレーニングを完了する
            </button>
          </div>
        )}
      </div>
    );
  };

  // Tab 3: Calendar View
  const renderCalendar = () => {
    // Generate dates for calendar month view
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => null);
    const calendarCells = [...blanksArray, ...daysArray];

    const changeMonth = (offset) => {
      setCalendarDate(new Date(year, month + offset, 1));
      setSelectedDayWorkouts(null);
    };

    const handleDayClick = (day) => {
      if (!day) return;
      const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayLogs = workouts.filter(w => w.date === formattedDate);
      setSelectedDayWorkouts({
        date: formattedDate,
        logs: dayLogs
      });
    };

    const hasWorkouts = (day) => {
      if (!day) return false;
      const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      return workouts.some(w => w.date === formattedDate);
    };

    return (
      <div className="app-content animate-fade-in">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>カレンダー履歴</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>日ごとのトレーニング結果を確認できます。</p>
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
          <button className="stepper-btn" style={{ width: '36px', height: '36px', fontSize: '1.2rem' }} onClick={() => changeMonth(-1)}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontFamily: 'var(--font-header)', fontWeight: 700, fontSize: '1.1rem' }}>
            {year}年 {monthNames[month]}
          </span>
          <button className="stepper-btn" style={{ width: '36px', height: '36px', fontSize: '1.2rem' }} onClick={() => changeMonth(1)}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <span>日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span>
          </div>

          {/* Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '12px', textAlign: 'center' }}>
            {calendarCells.map((day, idx) => {
              const active = hasWorkouts(day);
              const formattedDate = day ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : '';
              const isSelected = selectedDayWorkouts && selectedDayWorkouts.date === formattedDate;

              return (
                <div 
                  key={idx} 
                  onClick={() => handleDayClick(day)}
                  style={{
                    height: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: day ? 'pointer' : 'default',
                    position: 'relative'
                  }}
                >
                  {day && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      background: isSelected 
                        ? 'var(--primary-color)' 
                        : (active ? 'rgba(0, 229, 255, 0.15)' : 'transparent'),
                      border: isSelected 
                        ? 'none' 
                        : (active ? '1px solid var(--primary-color)' : 'none'),
                      color: isSelected ? 'var(--bg-color)' : 'var(--text-primary)'
                    }}>
                      {day}
                    </div>
                  )}
                  {active && !isSelected && (
                    <span style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--primary-color)',
                      boxShadow: '0 0 6px var(--primary-glow)'
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Logs Drawer/View */}
        {selectedDayWorkouts && (
          <div className="glass-card animate-slide-up" style={{ borderColor: 'rgba(0, 229, 255, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                {selectedDayWorkouts.date.replace(/-/g, '/')} の記録
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                合計 {selectedDayWorkouts.logs.length} 種目
              </span>
            </div>

            {selectedDayWorkouts.logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                この日のワークアウト記録はありません。
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedDayWorkouts.logs.map((w, idx) => (
                  <div key={w.id || idx} style={{ 
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>{w.exerciseName}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>器具: {w.equipment === 'Smith Machine' ? 'スミスマシン' : 'ダンベル'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', background: 'rgba(0, 229, 255, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                          {w.caloriesBurned} kcal
                        </span>
                        <button 
                          onClick={() => deleteWorkout(w.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {w.sets.map((s, sIdx) => (
                        <span key={sIdx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                          {s.weight}kg × {s.reps}回
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Tab 4: EufyLife Weight Sync Center
  const renderWeightCenter = () => {
    // Render Weight Trend SVG Graph
    const renderGraph = () => {
      if (weightHistory.length < 2) {
        return (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            グラフ表示には2件以上の記録が必要です。
          </div>
        );
      }

      // Sort chronological
      const sortedHistory = [...weightHistory]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7); // Last 7 records

      const weights = sortedHistory.map(h => h.weight);
      const minWeight = Math.min(...weights) - 0.5;
      const maxWeight = Math.max(...weights) + 0.5;
      const weightRange = maxWeight - minWeight;

      // SVG Dimensions
      const width = 400;
      const height = 150;
      const paddingX = 40;
      const paddingY = 20;

      // Convert data to SVG coordinate path
      const points = sortedHistory.map((h, i) => {
        const x = paddingX + (i * (width - 2 * paddingX) / (sortedHistory.length - 1));
        const y = height - paddingY - ((h.weight - minWeight) * (height - 2 * paddingY) / weightRange);
        return { x, y, weight: h.weight, date: h.date };
      });

      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      
      // Gradient fill path
      const areaPath = `
        ${linePath} 
        L ${points[points.length - 1].x} ${height - paddingY} 
        L ${points[0].x} ${height - paddingY} Z
      `;

      return (
        <div style={{ position: 'relative' }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.0"/>
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[minWeight + 0.5, (minWeight + maxWeight) / 2, maxWeight - 0.5].map((w, idx) => {
              const y = height - paddingY - ((w - minWeight) * (height - 2 * paddingY) / weightRange);
              return (
                <g key={idx}>
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={width - paddingX} 
                    y2={y} 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={paddingX - 10} 
                    y={y + 4} 
                    fill="var(--text-muted)" 
                    fontSize="10" 
                    textAnchor="end"
                  >
                    {w.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Area under the line */}
            <path d={areaPath} fill="url(#chartGrad)" />

            {/* The Line */}
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--primary-color)" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ filter: 'drop-shadow(0 0 4px var(--primary-glow))' }}
            />

            {/* Points & Labels */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="4" 
                  fill="var(--bg-color)" 
                  stroke="var(--primary-color)" 
                  strokeWidth="2.5" 
                />
                <text 
                  x={p.x} 
                  y={p.y - 10} 
                  fill="var(--text-primary)" 
                  fontSize="9" 
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {p.weight}
                </text>
                <text 
                  x={p.x} 
                  y={height - 4} 
                  fill="var(--text-muted)" 
                  fontSize="8" 
                  textAnchor="middle"
                >
                  {p.date.substr(5)} {/* MM-DD */}
                </text>
              </g>
            ))}
          </svg>
        </div>
      );
    };

    // Calculate weight statistics
    const getWeightStats = () => {
      if (weightHistory.length === 0) return { change: 0, first: 0, latest: 0 };
      const sorted = [...weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
      const first = sorted[0].weight;
      const latest = sorted[sorted.length - 1].weight;
      return {
        first,
        latest,
        change: Math.round((latest - first) * 10) / 10
      };
    };

    const stats = getWeightStats();

    return (
      <div className="app-content animate-fade-in">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>EufyLife 体重連携</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>EufyLifeアプリで測定した体重データを同期します。</p>
        </div>

        {/* Weight Stats Indicator */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--spacing-md)' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>最新同期の体重</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {getCurrentWeight()}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>kg</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              日付: {weightHistory.length > 0 ? [...weightHistory].sort((a,b) => new Date(b.date)-new Date(a.date))[0].date : '未登録'}
            </span>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>体重推移</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              {stats.change < 0 ? (
                <TrendingDown className="text-success" size={20} />
              ) : (
                <TrendingDown className="text-muted" size={20} style={{ transform: 'rotate(180deg)' }} />
              )}
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: stats.change < 0 ? 'var(--success-color)' : 'var(--text-primary)' }}>
                {stats.change > 0 ? `+${stats.change}` : stats.change} kg
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              初期: {stats.first}kg からの比較
            </span>
          </div>
        </div>

        {/* SVG Weight Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>体重推移グラフ (直近7レコード)</h3>
          {renderGraph()}
        </div>

        {/* CSV Import Section */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload className="text-primary" size={16} />
            <span>EufyLife CSVファイル インポート</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            EufyLifeアプリでエクスポートしたCSVファイルを読み込みます。<br/>
            [アプリ設定 → Me → データ → 全てのデータをエクスポート]
          </p>

          <div 
            onClick={() => csvInputRef.current.click()}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.01)',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <Upload size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', fontWeight: 600 }}>
              ファイルを選択してアップロード
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              (またはドラッグ＆ドロップ)
            </span>
            <input 
              type="file" 
              ref={csvInputRef} 
              style={{ display: 'none' }} 
              accept=".csv" 
              onChange={handleCSVUpload}
            />
          </div>

          {csvError && (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '8px', background: 'rgba(255, 23, 68, 0.05)', padding: '6px 10px', borderRadius: '4px' }}>
              ⚠️ {csvError}
            </div>
          )}

          {csvSuccess && (
            <div style={{ color: 'var(--success-color)', fontSize: '0.75rem', marginTop: '8px', background: 'rgba(0, 230, 118, 0.05)', padding: '6px 10px', borderRadius: '4px' }}>
              ✓ {csvSuccess}
            </div>
          )}

          {/* Sample CSV Generate Button */}
          <button 
            className="btn-secondary" 
            style={{ marginTop: '12px', fontSize: '0.75rem', height: '36px' }}
            onClick={downloadSampleCSV}
          >
            <Info size={14} /> テスト用CSVファイルをダウンロード
          </button>
        </div>

        {/* Mock Cloud Synchronization */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudLightning className="text-secondary" size={16} />
            <span>EufyLife クラウド連携 (デモ)</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            アカウントに接続して最新の体重データを直接インポートします。
          </p>

          <form onSubmit={handleCloudSync} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="EufyLife メールアドレス"
                value={eufyEmail}
                onChange={e => setEufyEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  paddingLeft: '36px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="パスワード"
                value={eufyPassword}
                onChange={e => setEufyPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  paddingLeft: '36px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ background: 'var(--secondary-color)', boxShadow: '0 4px 15px var(--secondary-glow)' }}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Syncing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} /> クラウドから同期する
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Dynamic Toast System */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 229, 255, 0.95)',
          color: 'var(--bg-color)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 24px rgba(0, 229, 255, 0.3)',
          zIndex: 1000,
          fontWeight: 600,
          fontSize: '0.85rem',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {renderHeader()}

      {currentTab === 'dashboard' && renderDashboard()}
      {currentTab === 'logger' && renderLogger()}
      {currentTab === 'calendar' && renderCalendar()}
      {currentTab === 'weight' && renderWeightCenter()}

      {renderBottomNav()}
    </div>
  );
}

export default App;
