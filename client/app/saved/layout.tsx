export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="-mt-8 min-h-full min-w-full pt-8 dark:bg-black">
      {children}
    </div>
  );
}
