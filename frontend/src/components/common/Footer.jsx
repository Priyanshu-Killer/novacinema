import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-nova-900/50 border-t border-nova-700/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-display font-bold text-xl text-white">NOVA<span className="text-gradient">CINEMA</span></span>
            <p className="mt-3 text-nova-400 text-sm leading-relaxed max-w-xs">
              Experience cinema reimagined. The future of movie booking, with futuristic seat selection and seamless real-time booking.
            </p>
            <div className="flex gap-4 mt-4">
              {['twitter', 'instagram', 'youtube'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-nova-700 flex items-center justify-center text-nova-300 hover:bg-nova-500 hover:text-white transition-all">
                  <span className="text-xs">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white mb-4 tracking-wider">EXPLORE</h4>
            <ul className="space-y-2 text-sm text-nova-400">
              {[['/', 'Home'], ['/movies', 'Movies'], ['/my-bookings', 'My Bookings']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-cyan-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white mb-4 tracking-wider">LEGAL</h4>
            <ul className="space-y-2 text-sm text-nova-400">
              {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(item => (
                <li key={item}><a href="#" className="hover:text-cyan-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-nova-700/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-nova-500 text-xs font-mono">© 2025 NovaCinema. All rights reserved.</p>
          <p className="text-nova-600 text-xs">Crafted with ✦ for the future of cinema</p>
        </div>
      </div>
    </footer>
  )
}
