import Lanyard from '@/components/Lanyard';

export default function Home() {
  return (
    <main className="page-shell">
      <Lanyard
        cardColor="#ffffff"
        strapColor="#111111"
        finish="glossy"
        orientation="portrait"
        size={0.78}
        strapLength={0.7}
        interactive
        intro
        style={{ width: 'min(80vw, 520px)', height: '760px' }}
      />
    </main>
  );
}
