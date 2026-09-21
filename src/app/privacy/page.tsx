export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose mt-8 space-y-6 text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-slate-900">1. Introduction</h2>
          <p className="mt-2">
            Tutor Hub ("we," "our," or "the Service") is a scheduling, payment, and communication platform for independent tutors and their students. This policy describes what information we collect, how we use it, and the third-party services involved in providing the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">2. Information We Collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Account information: name, email address, timezone</li>
            <li>Lesson data: scheduled times, topics, and video call links</li>
            <li>Homework content: assignment text and any files students upload</li>
            <li>Messages sent between tutors and students within the Service</li>
            <li>Payment records: amounts and status (We do not store full card numbers. Payment processing is handled by Stripe)</li>
            <li>If you connect Google Calendar: the ability to create, update, and delete calendar events related to your lessons and availability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">3. How We Use Information</h2>
          <p className="mt-2">
            We use the information above solely to operate the Service: scheduling lessons, facilitating payments between students and tutors, enabling video calls, sending relevant email notifications (booking confirmations, reminders, homework updates), and syncing calendar events for users who choose to connect Google Calendar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">4. Third-Party Services</h2>
          <p className="mt-2">The Service relies on the following third parties to operate:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Supabase</strong> database hosting and authentication</li>
            <li><strong>Stripe</strong> payment processing (PCI-compliant; we never see or store raw card details)</li>
            <li><strong>Daily.co</strong> video call infrastructure</li>
            <li><strong>Resend</strong> transactional email delivery</li>
            <li><strong>Google Calendar API</strong> optional calendar sync, only for users who explicitly connect it</li>
            <li><strong>Vercel</strong> application hosting</li>
          </ul>
          <p className="mt-3">
            Tutor Hub's use and transfer of information received from Google APIs to any other app will adhere to the{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-primary underline">
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">5. Data Retention</h2>
          <p className="mt-2">
            We retain account and activity data for as long as your account remains active. You may request deletion of your account and associated data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">6. Children's Privacy</h2>
          <p className="mt-2">
            Tutor Hub is designed to be used by tutors and their adult or minor students under the supervision and account of a parent, guardian, or the tutor themselves. Tutors are responsible for obtaining any consent required by applicable law before adding a minor as a student on the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">7. Your Rights</h2>
          <p className="mt-2">
            You may request access to, correction of, or deletion of your personal information at any time by contacting us at the email below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">8. Changes to This Policy</h2>
          <p className="mt-2">We may update this policy from time to time. Material changes will be reflected by an updated "Last updated" date above.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">9. Contact</h2>
          <p className="mt-2">Questions about this policy can be directed to: <strong>[kevinbaremore07@gmail.com]</strong></p>
        </section>
      </div>
    </div>
  );
}