// Contact API Client — submits portfolio contact form to Azure Function
// Falls back to mailto: link when backend is unavailable (career-fair offline mode)

class ContactAPI {
  constructor(apiUrl = '/api/contact') {
    this.apiUrl = apiUrl;
  }

  // Submit contact form data
  async submit({ name, email, subject, message }) {
    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        return { success: false, error: error.error || 'Server error' };
      }

      const data = await res.json();
      return { success: true, message: data.message || 'Email sent successfully' };
    } catch (err) {
      // Backend unavailable — fall back to mailto: link
      return this._fallbackMailto(name, email, subject, message);
    }
  }

  // Fallback: open browser mailto: link when API is unreachable
  _fallbackMailto(name, email, subject, message) {
    const to = encodeURIComponent('eugene.vince55@gmail.com');
    const subj = encodeURIComponent(`[Portfolio] ${subject} — from ${name}`);
    const body = encodeURIComponent(`Hi Eugene,\n\nFrom: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`);
    const mailto = `mailto:${to}?subject=${subj}&body=${body}`;

    // Open mailto link in new window (less intrusive than current page)
    window.open(mailto, '_blank');

    return {
      success: true,
      message: 'Email client opened (backend unavailable)',
      fallback: true
    };
  }
}

export default ContactAPI;
