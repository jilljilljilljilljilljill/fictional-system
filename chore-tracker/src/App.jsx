import React, { useState, useEffect } from 'react';
import { Star, Trophy, Flame, Check, Plus, Settings, Gift, TrendingUp, Heart, Brain, Target } from 'lucide-react';

const FamilyChoreTracker = () => {
  const [view, setView] = useState('loading');
  const [caregivers, setCaregivers] = useState([]);
  const [children, setChildren] = useState([]);
  const [currentCaregiver, setCurrentCaregiver] = useState(null);
  const [currentChild, setCurrentChild] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [caregiversRes, childrenRes, tasksRes, completionsRes, rewardsRes] = await Promise.all([
        window.storage.get('caregivers').catch(() => null),
        window.storage.get('children').catch(() => null),
        window.storage.get('tasks').catch(() => null),
        window.storage.get('completions').catch(() => null),
        window.storage.get('rewards').catch(() => null)
      ]);

      if (caregiversRes?.value) setCaregivers(JSON.parse(caregiversRes.value));
      if (childrenRes?.value) setChildren(JSON.parse(childrenRes.value));
      if (tasksRes?.value) setTasks(JSON.parse(tasksRes.value));
      if (completionsRes?.value) setCompletions(JSON.parse(completionsRes.value));
      if (rewardsRes?.value) setRewards(JSON.parse(rewardsRes.value));

      // Determine initial view
      if (!caregiversRes?.value) {
        setView('setup');
      } else {
        setView('caregiver-login');
      }
    } catch (error) {
      console.error('Load error:', error);
      setView('setup');
    }
  };

  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Setup caregivers
  const setupCaregivers = async (names) => {
    const newCaregivers = names.map((name, idx) => ({
      id: `cg-${Date.now()}-${idx}`,
      name,
      pin: Math.floor(1000 + Math.random() * 9000).toString()
    }));
    setCaregivers(newCaregivers);
    await saveData('caregivers', newCaregivers);
    setView('child-setup');
  };

  // Setup children
  const setupChildren = async (childrenData) => {
    const newChildren = childrenData.map((child, idx) => ({
      id: `child-${Date.now()}-${idx}`,
      name: child.name,
      age: child.age,
      points: 0,
      level: 1,
      avatar: child.avatar
    }));
    setChildren(newChildren);
    await saveData('children', newChildren);
    
    // Create default tasks
    const defaultTasks = [];
    newChildren.forEach(child => {
      const ageTasks = getAgeAppropriateTasks(child.age);
      ageTasks.forEach((task, idx) => {
        defaultTasks.push({
          id: `task-${child.id}-${idx}`,
          childId: child.id,
          ...task
        });
      });
    });
    setTasks(defaultTasks);
    await saveData('tasks', defaultTasks);

    // Create default rewards
    const defaultRewards = [
      { id: 'r1', name: '30 min screen time', cost: 50, icon: '📱' },
      { id: 'r2', name: 'Choose dinner', cost: 100, icon: '🍕' },
      { id: 'r3', name: 'Stay up 30 min late', cost: 150, icon: '🌙' },
      { id: 'r4', name: 'Special dessert', cost: 75, icon: '🍰' },
      { id: 'r5', name: 'Friend playdate', cost: 200, icon: '🎉' },
      { id: 'r6', name: 'Pick family movie', cost: 100, icon: '🎬' },
    ];
    setRewards(defaultRewards);
    await saveData('rewards', defaultRewards);

    setView('caregiver-login');
  };

  const getAgeAppropriateTasks = (age) => {
    const baseTasks = [
      // Daily routines
      { name: 'Get dressed', type: 'chore', category: 'morning', points: 10, icon: '👕' },
      { name: 'Brush teeth (AM)', type: 'chore', category: 'morning', points: 10, icon: '🦷' },
      { name: 'Make bed', type: 'chore', category: 'morning', points: 15, icon: '🛏️' },
      { name: 'Put away backpack', type: 'chore', category: 'afternoon', points: 10, icon: '🎒' },
      { name: 'Homework', type: 'chore', category: 'afternoon', points: 20, icon: '📚' },
      { name: 'Clean up toys', type: 'chore', category: 'evening', points: 15, icon: '🧸' },
      { name: 'Brush teeth (PM)', type: 'chore', category: 'evening', points: 10, icon: '🦷' },
      { name: 'Put clothes in hamper', type: 'chore', category: 'evening', points: 10, icon: '🧺' },
      
      // Behaviors
      { name: 'Showed kindness', type: 'behavior', category: 'values', points: 25, icon: '💝' },
      { name: 'Took responsibility', type: 'behavior', category: 'values', points: 30, icon: '🎯' },
      { name: 'Showed perseverance', type: 'behavior', category: 'values', points: 30, icon: '💪' },
      { name: 'Helped without being asked', type: 'behavior', category: 'values', points: 35, icon: '🌟' },
      { name: 'Shared with sibling', type: 'behavior', category: 'values', points: 25, icon: '🤝' },
    ];

    // Add age-appropriate chores
    if (age >= 5) {
      baseTasks.push(
        { name: 'Set the table', type: 'chore', category: 'household', points: 20, icon: '🍽️' },
        { name: 'Feed pet', type: 'chore', category: 'household', points: 15, icon: '🐕' },
      );
    }
    if (age >= 7) {
      baseTasks.push(
        { name: 'Empty dishwasher', type: 'chore', category: 'household', points: 25, icon: '🧼' },
        { name: 'Take out trash', type: 'chore', category: 'household', points: 20, icon: '🗑️' },
      );
    }
    if (age >= 9) {
      baseTasks.push(
        { name: 'Vacuum room', type: 'chore', category: 'household', points: 30, icon: '🧹' },
        { name: 'Do laundry', type: 'chore', category: 'household', points: 40, icon: '👔' },
      );
    }

    return baseTasks;
  };

  // Complete task
  const completeTask = async (taskId, childId) => {
    const task = tasks.find(t => t.id === taskId);
    const child = children.find(c => c.id === childId);
    const today = new Date().toDateString();

    // Check for existing completion today
    const alreadyCompleted = completions.some(
      c => c.taskId === taskId && c.childId === childId && c.date === today
    );

    if (alreadyCompleted) return;

    // Calculate streak bonus
    const childCompletions = completions.filter(c => c.childId === childId && c.taskId === taskId);
    const streak = calculateStreak(childCompletions);
    const streakBonus = Math.floor(streak / 3) * 5; // +5 points every 3 days
    const totalPoints = task.points + streakBonus;

    // Add completion
    const newCompletion = {
      id: `comp-${Date.now()}`,
      taskId,
      childId,
      date: today,
      points: totalPoints,
      streakBonus
    };
    const updatedCompletions = [...completions, newCompletion];
    setCompletions(updatedCompletions);
    await saveData('completions', updatedCompletions);

    // Update child points and level
    const updatedChildren = children.map(c => {
      if (c.id === childId) {
        const newPoints = c.points + totalPoints;
        const newLevel = Math.floor(newPoints / 100) + 1;
        return { ...c, points: newPoints, level: newLevel };
      }
      return c;
    });
    setChildren(updatedChildren);
    await saveData('children', updatedChildren);

    // Show celebration
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const calculateStreak = (taskCompletions) => {
    if (taskCompletions.length === 0) return 0;

    const sortedDates = taskCompletions
      .map(c => new Date(c.date))
      .sort((a, b) => b - a);

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if completed today or yesterday
    const lastCompletion = sortedDates[0];
    lastCompletion.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastCompletion) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0;

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);

      const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Redeem reward
  const redeemReward = async (rewardId, childId) => {
    const reward = rewards.find(r => r.id === rewardId);
    const child = children.find(c => c.id === childId);

    if (child.points < reward.cost) return;

    const updatedChildren = children.map(c => {
      if (c.id === childId) {
        return { ...c, points: c.points - reward.cost };
      }
      return c;
    });
    setChildren(updatedChildren);
    await saveData('children', updatedChildren);

    alert(`${child.name} redeemed: ${reward.name}! 🎉`);
  };

  // Render functions
  const renderSetup = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-6 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-600">Family Chore Tracker</h1>
        <SetupForm onComplete={setupCaregivers} />
      </div>
    </div>
  );

  const renderChildSetup = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 p-6 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Add Your Kids</h2>
        <ChildSetupForm onComplete={setupChildren} />
      </div>
    </div>
  );

  const renderCaregiverLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-500 p-6 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">Who's here?</h2>
        <div className="space-y-4">
          {caregivers.map(cg => (
            <button
              key={cg.id}
              onClick={() => {
                setCurrentCaregiver(cg);
                setView('caregiver-dashboard');
              }}
              className="w-full bg-indigo-500 text-white rounded-xl p-4 font-semibold hover:bg-indigo-600 transition"
            >
              {cg.name}
            </button>
          ))}
          <button
            onClick={() => setView('child-login')}
            className="w-full bg-green-500 text-white rounded-xl p-4 font-semibold hover:bg-green-600 transition"
          >
            I'm a Kid! 🎉
          </button>
        </div>
      </div>
    </div>
  );

  const renderChildLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500 p-6 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-orange-600">Pick Your Avatar!</h2>
        <div className="grid grid-cols-2 gap-4">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => {
                setCurrentChild(child);
                setView('child-dashboard');
              }}
              className="bg-gradient-to-br from-pink-400 to-purple-400 text-white rounded-2xl p-6 font-bold text-xl hover:scale-105 transition transform"
            >
              <div className="text-4xl mb-2">{child.avatar}</div>
              {child.name}
              <div className="text-sm mt-2">Level {child.level}</div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setView('caregiver-login')}
          className="w-full mt-6 bg-gray-300 text-gray-700 rounded-xl p-3 font-semibold hover:bg-gray-400 transition"
        >
          Back
        </button>
      </div>
    </div>
  );

  const renderCaregiverDashboard = () => {
    const today = new Date().toDateString();

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {currentCaregiver.name}!</h1>
              <button
                onClick={() => setView('caregiver-login')}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Children overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {children.map(child => {
              const todayCompletions = completions.filter(
                c => c.childId === child.id && c.date === today
              );
              const todayPoints = todayCompletions.reduce((sum, c) => sum + c.points, 0);

              return (
                <div key={child.id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-2">{child.avatar}</div>
                    <h3 className="text-xl font-bold mb-2">{child.name}</h3>
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <Trophy className="text-yellow-500" size={20} />
                      <span className="font-semibold">Level {child.level}</span>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-3 mb-3">
                      <div className="text-sm text-purple-600">Total Points</div>
                      <div className="text-2xl font-bold text-purple-700">{child.points}</div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <div className="text-sm text-green-600">Today</div>
                      <div className="text-xl font-bold text-green-700">+{todayPoints}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Task management */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Award Points</h2>
            {children.map(child => (
              <div key={child.id} className="mb-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>{child.avatar}</span>
                  {child.name}'s Tasks
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {tasks
                    .filter(t => t.childId === child.id)
                    .map(task => {
                      const completed = completions.some(
                        c => c.taskId === task.id && c.childId === child.id && c.date === today
                      );
                      const taskCompletions = completions.filter(
                        c => c.taskId === task.id && c.childId === child.id
                      );
                      const streak = calculateStreak(taskCompletions);

                      return (
                        <button
                          key={task.id}
                          onClick={() => !completed && completeTask(task.id, child.id)}
                          disabled={completed}
                          className={`p-4 rounded-xl text-left transition ${
                            completed
                              ? 'bg-green-100 border-2 border-green-400'
                              : 'bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{task.icon}</span>
                              <div>
                                <div className="font-semibold">{task.name}</div>
                                <div className="text-sm text-gray-600">
                                  {task.points} points
                                  {streak > 0 && (
                                    <span className="ml-2 text-orange-600 flex items-center gap-1 inline-flex">
                                      <Flame size={14} />
                                      {streak} day streak
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {completed && <Check className="text-green-600" size={24} />}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderChildDashboard = () => {
    const today = new Date().toDateString();
    const childTasks = tasks.filter(t => t.childId === currentChild.id);
    const todayCompletions = completions.filter(
      c => c.childId === currentChild.id && c.date === today
    );
    const todayPoints = todayCompletions.reduce((sum, c) => sum + c.points, 0);

    const morningTasks = childTasks.filter(t => t.category === 'morning');
    const afternoonTasks = childTasks.filter(t => t.category === 'afternoon');
    const eveningTasks = childTasks.filter(t => t.category === 'evening');
    const valueTasks = childTasks.filter(t => t.type === 'behavior');

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 p-4">
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-9xl animate-bounce">🌟</div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 mb-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-purple-600">Hi {currentChild.name}!</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Trophy className="text-yellow-500" size={24} />
                  <span className="text-xl font-bold">Level {currentChild.level}</span>
                </div>
              </div>
              <div className="text-6xl">{currentChild.avatar}</div>
            </div>

            {/* Points display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white text-center">
                <Star className="mx-auto mb-2" size={32} />
                <div className="text-2xl font-bold">{currentChild.points}</div>
                <div className="text-sm">Total Stars</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl p-4 text-white text-center">
                <TrendingUp className="mx-auto mb-2" size={32} />
                <div className="text-2xl font-bold">+{todayPoints}</div>
                <div className="text-sm">Today's Stars</div>
              </div>
            </div>
          </div>

          {/* Tasks by time of day */}
          <TaskSection
            title="Morning Routine ☀️"
            tasks={morningTasks}
            completions={completions}
            childId={currentChild.id}
            onComplete={completeTask}
          />

          <TaskSection
            title="After School 📚"
            tasks={afternoonTasks}
            completions={completions}
            childId={currentChild.id}
            onComplete={completeTask}
          />

          <TaskSection
            title="Evening Routine 🌙"
            tasks={eveningTasks}
            completions={completions}
            childId={currentChild.id}
            onComplete={completeTask}
          />

          <TaskSection
            title="Special Stars 🌟"
            tasks={valueTasks}
            completions={completions}
            childId={currentChild.id}
            onComplete={completeTask}
            special={true}
          />

          {/* Rewards shop */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl mb-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-600">
              <Gift size={28} />
              Rewards Shop
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {rewards.map(reward => {
                const canAfford = currentChild.points >= reward.cost;
                return (
                  <button
                    key={reward.id}
                    onClick={() => canAfford && redeemReward(reward.id, currentChild.id)}
                    disabled={!canAfford}
                    className={`p-4 rounded-2xl text-center transition transform ${
                      canAfford
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white hover:scale-105'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <div className="text-4xl mb-2">{reward.icon}</div>
                    <div className="font-bold text-sm mb-1">{reward.name}</div>
                    <div className="text-xs flex items-center justify-center gap-1">
                      <Star size={12} />
                      {reward.cost}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setView('child-login')}
            className="w-full bg-white text-gray-700 rounded-2xl p-4 font-bold shadow-lg hover:bg-gray-100 transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  };

  // Main render
  if (view === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (view === 'setup') return renderSetup();
  if (view === 'child-setup') return renderChildSetup();
  if (view === 'caregiver-login') return renderCaregiverLogin();
  if (view === 'child-login') return renderChildLogin();
  if (view === 'caregiver-dashboard') return renderCaregiverDashboard();
  if (view === 'child-dashboard') return renderChildDashboard();

  return null;
};

// Setup form component
const SetupForm = ({ onComplete }) => {
  const [caregiver1, setCaregiver1] = useState('');
  const [caregiver2, setCaregiver2] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const names = [caregiver1, caregiver2].filter(n => n.trim());
    if (names.length > 0) {
      onComplete(names);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">Caregiver 1 Name</label>
        <input
          type="text"
          value={caregiver1}
          onChange={(e) => setCaregiver1(e.target.value)}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-500 focus:outline-none"
          placeholder="e.g., Mom"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">Caregiver 2 Name</label>
        <input
          type="text"
          value={caregiver2}
          onChange={(e) => setCaregiver2(e.target.value)}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-500 focus:outline-none"
          placeholder="e.g., Dad"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 font-bold hover:from-purple-600 hover:to-pink-600 transition"
      >
        Next Step →
      </button>
    </form>
  );
};

// Child setup form
const ChildSetupForm = ({ onComplete }) => {
  const [children, setChildren] = useState([
    { name: '', age: '', avatar: '🦄' }
  ]);

  const avatars = ['🦄', '🦖', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🐸', '🐙'];

  const addChild = () => {
    setChildren([...children, { name: '', age: '', avatar: avatars[children.length % avatars.length] }]);
  };

  const updateChild = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = children.filter(c => c.name && c.age);
    if (valid.length > 0) {
      onComplete(valid.map(c => ({ ...c, age: parseInt(c.age) })));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children.map((child, idx) => (
        <div key={idx} className="border-2 border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <select
              value={child.avatar}
              onChange={(e) => updateChild(idx, 'avatar', e.target.value)}
              className="text-3xl bg-transparent"
            >
              {avatars.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={child.name}
                onChange={(e) => updateChild(idx, 'name', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                placeholder="Child's name"
                required
              />
              <input
                type="number"
                value={child.age}
                onChange={(e) => updateChild(idx, 'age', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                placeholder="Age"
                min="3"
                max="18"
                required
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addChild}
        className="w-full bg-blue-100 text-blue-600 rounded-lg p-3 font-semibold hover:bg-blue-200 transition flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Another Child
      </button>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-4 font-bold hover:from-blue-600 hover:to-green-600 transition"
      >
        Let's Go! 🚀
      </button>
    </form>
  );
};

// Task section component
const TaskSection = ({ title, tasks, completions, childId, onComplete, special = false }) => {
  const today = new Date().toDateString();

  if (tasks.length === 0) return null;

  return (
    <div className={`rounded-3xl p-6 shadow-2xl mb-4 ${special ? 'bg-gradient-to-br from-yellow-300 to-orange-300' : 'bg-white'}`}>
      <h2 className={`text-xl font-bold mb-4 ${special ? 'text-orange-800' : 'text-gray-800'}`}>{title}</h2>
      <div className="space-y-3">
        {tasks.map(task => {
          const completed = completions.some(
            c => c.taskId === task.id && c.childId === childId && c.date === today
          );
          const taskCompletions = completions.filter(
            c => c.taskId === task.id && c.childId === childId
          );
          const streak = calculateStreak(taskCompletions);

          return (
            <button
              key={task.id}
              onClick={() => !completed && onComplete(task.id, childId)}
              disabled={completed}
              className={`w-full p-4 rounded-2xl text-left transition transform ${
                completed
                  ? 'bg-green-400 text-white scale-95'
                  : 'bg-white hover:bg-purple-50 hover:scale-105 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{task.icon}</span>
                  <div>
                    <div className="font-bold text-lg">{task.name}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="text-yellow-500" size={16} />
                      <span className="font-semibold">{task.points} stars</span>
                      {streak > 0 && (
                        <span className="flex items-center gap-1 text-orange-600 font-bold">
                          <Flame size={16} />
                          {streak} 🔥
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {completed && (
                  <div className="text-4xl">✅</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const calculateStreak = (taskCompletions) => {
  if (taskCompletions.length === 0) return 0;

  const sortedDates = taskCompletions
    .map(c => new Date(c.date))
    .sort((a, b) => b - a);

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastCompletion = sortedDates[0];
  lastCompletion.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today - lastCompletion) / (1000 * 60 * 60 * 24));

  if (daysDiff > 1) return 0;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    current.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);

    const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export default FamilyChoreTracker;
