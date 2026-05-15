import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
