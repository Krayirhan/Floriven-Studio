import { Button } from '../../../components/ui';
import styles from './CtaBand.module.css';

export function CtaBand() {
  return (
    <div className={styles.band}>
      <h2>Brief'ten <em>güzel</em> bir uygulamaya,<br />saniyeler içinde.</h2>
      <Button href="#" variant="white">Erken erişim al →</Button>
    </div>
  );
}
