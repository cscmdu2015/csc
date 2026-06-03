import React from "react";
import { Mail, Phone, MapPin, Clock, Building, Map } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl">
          Contact Details
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Get in touch with the official administrative office of Central School of Commerce.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info Card */}
        <div className="glass-panel p-8 shadow-2xl relative overflow-hidden glow-indigo">
          <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-brand-indigo/10 rounded-full filter blur-xl pointer-events-none" />
          
          <h2 className="text-lg font-bold text-white uppercase mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-indigo" />
            <span>Central School of Commerce</span>
          </h2>

          <div className="space-y-6 text-sm text-slate-300">
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-brand-indigo flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Official Mobile</p>
                <p className="text-white font-semibold mt-1">8973120153</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-brand-indigo flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Admin Email</p>
                <a 
                  href="mailto:cscmdu2015@gmail.com" 
                  className="text-brand-indigo hover:text-brand-indigo-400 hover:underline font-semibold mt-1 block"
                >
                  cscmdu2015@gmail.com
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-brand-indigo flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Physical Address</p>
                <div className="text-white font-medium mt-1 leading-relaxed">
                  No. 130, Near Harvipatti Park,<br />
                  Harvipatti,<br />
                  Madurai - 625 005,<br />
                  Tamil Nadu, India.
                </div>
                
                {/* Google Maps Redirect Button */}
                <a 
                  href="https://maps.app.goo.gl/PG7FYRsq2Q3wPh6L7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs bg-slate-950/60 hover:bg-brand-indigo/20 border border-glass-border hover:border-brand-indigo text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                >
                  <Map className="w-3.5 h-3.5 text-brand-indigo" />
                  <span>View on Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Timings and Schedule */}
        <div className="glass-panel p-8 shadow-2xl relative overflow-hidden hover:border-brand-emerald/40 transition-all duration-300">
          <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-brand-emerald/10 rounded-full filter blur-xl pointer-events-none" />
          
          <h2 className="text-lg font-bold text-white uppercase mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-emerald" />
            <span>Office Hours</span>
          </h2>

          <div className="space-y-4 text-xs tracking-wider text-slate-400 uppercase">
            <div className="flex justify-between items-center border-b border-glass-border pb-3">
              <span>Monday - Saturday</span>
              <div className="text-white font-semibold text-right space-y-0.5">
                <div>06:00 AM - 12:00 PM</div>
                <div className="text-brand-emerald text-[10px]">and</div>
                <div>04:00 PM - 08:00 PM</div>
              </div>
            </div>
            <div className="flex justify-between pb-2.5">
              <span>Sunday</span>
              <span className="text-brand-danger font-semibold">Closed</span>
            </div>
          </div>

          <div className="mt-14 p-4 rounded-lg bg-brand-emerald/5 border border-brand-emerald/20 text-xs text-slate-300 leading-relaxed">
            Note: Typing practice machines are allocated to students in hourly slots. For scheduling adjustments or exam confirmations, contact the admin desk via phone or visit the institute directly.
          </div>
        </div>

      </div>
    </div>
  );
}