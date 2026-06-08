type LoadingOverlayProps = {
  label?: string;
  compact?: boolean;
};

export function LoadingOverlay({ label = "Carregando cuidado e carinho...", compact = false }: LoadingOverlayProps) {
  return (
    <div className={`scolt-loader ${compact ? "compact" : ""}`} role="status" aria-live="polite">
      <div className="scolt-loader-card">
        <div className="scolt-loader-mark">
          <span className="scolt-loader-ring" />
          <span className="scolt-loader-orbit paw-one" />
          <span className="scolt-loader-orbit paw-two" />
          <img src="/img/logo-scolt-cia.png" alt="Scolt&Cia" />
        </div>
        <strong>{label}</strong>
        <div className="scolt-loader-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
