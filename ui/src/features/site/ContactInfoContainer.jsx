import SectionHeading from './SectionHeading';
import './ContactInfoContainer.css';

function ContactInfoContainer() {
  return (
    <section className="block-container contact-info-container">
      <SectionHeading title="Свяжитесь с нами" />
      <ul className="contact-info-container__list">
        <li>+7 (495) 229-40-05</li>
        <li>Домодедово, тер. Триколор, 11</li>
      </ul>
    </section>
  );
}

export default ContactInfoContainer;
