import React, { useState } from 'react'
import emailjs from 'emailjs-com'

emailjs.init("VLxM2t4JmL7HsMc4F")

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const sendEmail = (e) => {
    e.preventDefault()

    const serviceID = "service_6kxz2ig"
    const templateID = "template_qd8leoi"

    const templateParams = {
      from_name: formData.name,
      reply_to: formData.email,
      message: formData.message,
    }

    emailjs
      .send(serviceID, templateID, templateParams)
      .then((res) => {
        console.log("✅ Email sent:", res)
        alert("Your message has been sent successfully!")
        setFormData({ name: "", email: "", message: "" })
      })
      .catch((err) => {
        console.error("❌ Email failed:", err)
        alert("Failed to send message. Please try again.")
      })
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Contact Us</h1>
        <div className="bg-gray-900 rounded-lg shadow-md p-8 border border-gray-800">
          <form onSubmit={sendEmail} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                placeholder="Your Name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                placeholder="Your Email"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-32 resize-none"
                placeholder="Your Message"
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 w-full font-semibold border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Additional Contact Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
            <div className="text-red-500 text-2xl mb-3">📧</div>
            <h3 className="text-white font-semibold mb-2">Email Us</h3>
            <p className="text-gray-400 text-sm">support@gamehub.com</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
            <div className="text-red-500 text-2xl mb-3">📞</div>
            <h3 className="text-white font-semibold mb-2">Call Us</h3>
            <p className="text-gray-400 text-sm">+1 (555) 123-GAME</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
            <div className="text-red-500 text-2xl mb-3">💬</div>
            <h3 className="text-white font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-400 text-sm">24/7 Support Available</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact