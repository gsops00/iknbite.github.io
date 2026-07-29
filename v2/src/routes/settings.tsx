export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">Configure your voice studio</p>
      <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
        <h2 className="font-heading text-sm font-semibold mb-4">About iknbite</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Free, open-source AI Voice Studio. Speech generation uses the Web Speech API built into modern browsers.</p>
      </div>
    </div>
  );
}
