import ChartTabs from '@/components/ChartTabs';

export default function Home() {
  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-4 pb-2" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-8 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #FF0033, #00D4FF)' }}
            />
            <div>
              <h1
                className="font-display text-2xl leading-none tracking-wide"
                style={{ color: '#FF0033' }}
              >
                BILLBOARD
              </h1>
              <p className="text-xs text-gray-500 tracking-widest uppercase">Chart Tracker</p>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Chart Tabs */}
      <main className="flex-1 overflow-hidden">
        <ChartTabs />
      </main>
    </div>
  );
}
