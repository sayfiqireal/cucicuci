'use client';

type Props = {
  onOpen: () => void;
};

export default function QueueButton({ onOpen }: Props) {
  return (
    <button
      onClick={onOpen}
      className="px-4 py-2 rounded-lg border border-primary text-primary font-medium hover:bg-primary/10 transition"
    >
      Lihat Antrian Sekarang
    </button>
  );
}
