import { Button } from "../atoms/Button";

export function ServiceDisableModal({ serviceName, isLoading, onConfirm, onCancel }) {
  return (
    <div className="service-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
      <div className="service-modal-card">
        <h3 id="service-modal-title">Cuidado, deseja desativar este servico?</h3>
        <p>{serviceName}</p>
        <div className="service-modal-actions">
          <Button variant="danger" className="service-modal-btn" onClick={onConfirm} disabled={isLoading}>
            Sim
          </Button>
          <Button variant="success" className="service-modal-btn" onClick={onCancel} disabled={isLoading}>
            Nao
          </Button>
        </div>
      </div>
    </div>
  );
}

