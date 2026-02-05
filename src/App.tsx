import { useState } from 'react';
import { Home as HomeIcon, CalendarDays, Settings as SettingsIcon } from 'lucide-react';
import Home from './components/Home';
import Calendar from './components/Calendar';
import Settings from './components/Settings';

type Screen = 'home' | 'calendar' | 'settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            休肝日チャレンジ
          </h1>
          <p className="text-center text-gray-600 text-sm mt-2">
            健康的なお酒ライフをサポート
          </p>
        </header>

        <main className="mb-20">
          {currentScreen === 'home' && <Home />}
          {currentScreen === 'calendar' && <Calendar />}
          {currentScreen === 'settings' && <Settings />}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
          <div className="max-w-2xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-2 py-3">
              <button
                onClick={() => setCurrentScreen('home')}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                  currentScreen === 'home'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <HomeIcon className="w-6 h-6" />
                <span className="text-xs font-medium">ホーム</span>
              </button>
              <button
                onClick={() => setCurrentScreen('calendar')}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                  currentScreen === 'calendar'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <CalendarDays className="w-6 h-6" />
                <span className="text-xs font-medium">カレンダー</span>
              </button>
              <button
                onClick={() => setCurrentScreen('settings')}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                  currentScreen === 'settings'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <SettingsIcon className="w-6 h-6" />
                <span className="text-xs font-medium">目標設定</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
