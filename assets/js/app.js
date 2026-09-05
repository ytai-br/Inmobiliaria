/* global jQuery, bootstrap, PRIME */
(function ($) {
  'use strict';
  const money = value => 'USD ' + new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(value);
  const escape = value => $('<span>').text(String(value)).html();
  const icon = name => `<i class="bi bi-${name}" aria-hidden="true"></i>`;
  const imagePath = (project, index) => `assets/images/project-${PRIME.projects.indexOf(project) + 1}-${index}.jpg`;
  const whatsapp = (phone, message) => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const getProject = id => PRIME.projects.find(project => project.id === id);
  let galleryProject;
  let galleryIndex = 0;

  function specs(project) {
    return `<dl class="project-specs"><div><dt>Superficies</dt><dd>${escape(project.area)}</dd></div><div><dt>Tipologías</dt><dd>${escape(project.bedrooms)}</dd></div><div><dt>Inversión desde</dt><dd class="price">${money(project.price)}</dd></div><div><dt>${escape(project.extraLabel)}</dt><dd>${escape(project.extra)}</dd></div></dl>`;
  }

  function renderProjects() {
    $('#project-list').html(PRIME.projects.map((project, number) => `
      <article class="project-card" id="edificio-${project.id}" data-project="${project.id}" aria-labelledby="title-${project.id}">
        <div class="row g-0"><div class="col-lg-7"><div class="project-gallery">
          <div class="project-main-image"><button type="button" class="open-gallery" data-index="0" aria-label="Ampliar galería de ${escape(project.name)}"><img class="project-cover" src="${imagePath(project, 0)}" alt="Fachada de ${escape(project.name)}" width="1000" height="625" loading="lazy"></button>
            <span class="status-badge ${project.status}"><span class="status-dot"></span>${escape(project.statusLabel)}</span><div class="image-caption"><small>${escape(project.highlight)}</small><strong>${project.floors} pisos · ${escape(project.category)}</strong></div><span class="image-expand">${icon('arrows-fullscreen')}</span>
          </div>
          <div class="gallery-thumbs" role="group" aria-label="Imágenes de ${escape(project.name)}">${project.captions.map((caption, index) => `<button type="button" class="gallery-thumb ${index === 0 ? 'active' : ''}" data-index="${index}" aria-pressed="${index === 0}" aria-label="Ver ${escape(caption.toLowerCase())} de ${escape(project.name)}"><img src="${imagePath(project, index)}" alt="" loading="lazy" width="180" height="115"></button>`).join('')}</div>
        </div></div><div class="col-lg-5"><div class="project-info"><div class="project-kicker"><span>Edificio ${String(number + 1).padStart(2, '0')} · ${escape(project.category)}</span><span>01 — ${String(project.floors).padStart(2, '0')} pisos</span></div>
          <h3 id="title-${project.id}">${escape(project.name)}</h3><p class="project-location">${icon('geo-alt')}${escape(project.location)}</p><p class="project-description">${escape(project.description)}</p>${specs(project)}<ul class="amenities" aria-label="Amenidades">${project.amenities.map(item => `<li>${escape(item)}</li>`).join('')}</ul>
          <div class="project-actions"><button type="button" class="btn btn-prime project-detail" data-project="${project.id}">${icon('grid-1x2')} Ficha y precios ${icon('arrow-right')}</button><a class="btn btn-green" href="${whatsapp(PRIME.whatsapp, `Hola, quisiera una cotización de ${project.name}.`)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar ${escape(project.name)} por WhatsApp">${icon('whatsapp')} WhatsApp</a></div>
        </div></div></div>
      </article>`).join(''));
    PRIME.projects.forEach(project => $('#contact-project').append($('<option>', { value: project.id, text: project.name })));
  }

  function renderAdvisors() {
    $('#advisor-list').html(PRIME.advisors.map((advisor, index) => `<div class="col-md-4"><article class="advisor-card"><div class="advisor-heading"><img src="assets/images/advisor-${index}.jpg" alt="${escape(advisor.name)}" loading="lazy" width="80" height="80"><div><small>${escape(advisor.tag)}</small><h3>${escape(advisor.name)}</h3><p>${escape(advisor.role)}</p></div></div><p class="advisor-description">${escape(advisor.description)}</p><dl class="advisor-details"><div><dt>WhatsApp</dt><dd><a href="tel:+${advisor.phone}">${escape(advisor.displayPhone)}</a></dd></div><div><dt>Especialidad</dt><dd>${escape(advisor.specialty)}</dd></div></dl><a class="btn btn-green w-100 mb-2" href="${whatsapp(advisor.phone, `Hola ${advisor.name}, quisiera asesoramiento sobre América Prime.`)}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')} WhatsApp directo</a><a class="btn btn-soft advisor-appointment" href="#contacto" data-advisor="${index}">${escape(advisor.action)}</a></article></div>`).join(''));
    PRIME.advisors.forEach((advisor, index) => $('#contact-advisor').append($('<option>', { value: String(index), text: advisor.name })));
  }

  function filterProjects() {
    const type = $('#filter-type').val();
    const status = $('#filter-status').val();
    const price = $('#filter-price').val();
    let count = 0;
    PRIME.projects.forEach(project => {
      const fitsPrice = price === 'all' || (price === 'under100' && project.price <= 95000) || (price === 'mid' && project.price >= 96000 && project.price <= 175000) || (price === 'high' && project.price >= 176000);
      const visible = (type === 'all' || project.types.includes(type)) && (status === 'all' || project.status === status) && fitsPrice;
      $(`#edificio-${project.id}`).prop('hidden', !visible);
      if (visible) count++;
    });
    $('#results-count').text(`${count} ${count === 1 ? 'edificio encontrado' : 'edificios encontrados'} de 7`);
    $('#empty-results').prop('hidden', count !== 0);
    $('.filter-chip').each(function () {
      const active = $(this).attr('data-status') === status;
      $(this).toggleClass('active', active).attr('aria-pressed', String(active));
    });
  }

  function showGalleryImage() {
    $('#gallery-image').attr({ src: imagePath(galleryProject, galleryIndex), alt: `${galleryProject.captions[galleryIndex]} · ${galleryProject.name}` });
    $('#gallery-caption').text(`${galleryIndex + 1} / ${galleryProject.captions.length} — ${galleryProject.captions[galleryIndex]}`);
    $('.gallery-stage').removeClass('zoomed').scrollTop(0).scrollLeft(0);
    $('#gallery-zoom').attr('aria-pressed', 'false').html(`${icon('zoom-in')} Ampliar`);
  }

  function stepGallery(step) {
    galleryIndex = (galleryIndex + step + galleryProject.captions.length) % galleryProject.captions.length;
    showGalleryImage();
  }

  function visitFields() {
    const isVisit = $('input[name="purpose"]:checked').val() === 'Agendar visita';
    $('#visit-fields').prop('hidden', !isVisit);
    $('#visit-date').prop('required', isVisit).prop('disabled', !isVisit);
  }

  function focusContact() {
    document.getElementById('contacto').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    document.getElementById('contact-name').focus({ preventScroll: true });
    invalidatePreparedMessage();
  }

  function invalidatePreparedMessage() {
    $('#contact-result').prop('hidden', true);
    $('#send-whatsapp').removeAttr('href');
  }

  $(function () {
    renderProjects();
    renderAdvisors();
    const today = new Date();
    $('#year').text(today.getFullYear());
    $('#visit-date').attr('min', `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    visitFields();
    $('#search-form').on('submit', function (event) {
      event.preventDefault(); filterProjects(); document.getElementById('proyectos').scrollIntoView();
    });
    $('#filter-type, #filter-status, #filter-price').on('change', filterProjects);
    $('.filter-chip').on('click', function () { $('#filter-status').val($(this).attr('data-status')); filterProjects(); });
    $('.reset-filters').on('click', function () { $('#search-form')[0].reset(); filterProjects(); });

    $('#project-list').on('click', '.gallery-thumb', function () {
      const card = $(this).closest('.project-card');
      const project = getProject(card.attr('data-project'));
      const index = Number($(this).attr('data-index'));
      card.find('.project-cover').attr({ src: imagePath(project, index), alt: `${project.captions[index]} · ${project.name}` });
      card.find('.open-gallery').attr('data-index', index);
      card.find('.gallery-thumb').removeClass('active').attr('aria-pressed', 'false');
      $(this).addClass('active').attr('aria-pressed', 'true');
    });
    $('#project-list').on('click', '.open-gallery', function () {
      galleryProject = getProject($(this).closest('.project-card').attr('data-project'));
      galleryIndex = Number($(this).attr('data-index'));
      $('#gallery-title').text(galleryProject.name);
      showGalleryImage();
      bootstrap.Modal.getOrCreateInstance('#gallery-modal').show(this);
    });
    $('.gallery-prev').on('click', () => stepGallery(-1));
    $('.gallery-next').on('click', () => stepGallery(1));
    $('#gallery-modal').on('keydown', function (event) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); stepGallery(event.key === 'ArrowRight' ? 1 : -1); }
    });
    $('#gallery-zoom').on('click', function () {
      const zoomed = !$('.gallery-stage').hasClass('zoomed');
      $('.gallery-stage').toggleClass('zoomed', zoomed);
      $(this).attr('aria-pressed', String(zoomed)).html(`${icon(zoomed ? 'zoom-out' : 'zoom-in')} ${zoomed ? 'Reducir' : 'Ampliar'}`);
    });
    let modalTrigger;
    $('#gallery-modal, #project-modal').on('show.bs.modal', function (event) { modalTrigger = event.relatedTarget; });
    $('#gallery-modal, #project-modal').on('hidden.bs.modal', function () { if (modalTrigger?.isConnected) modalTrigger.focus({ preventScroll: true }); });

    $('#project-list').on('click', '.project-detail', function () {
      const project = getProject($(this).attr('data-project'));
      $('#detail-title').text(project.name);
      $('#detail-content').html(`<img class="detail-image" src="${imagePath(project, 0)}" alt="Fachada de ${escape(project.name)}"><p class="eyebrow">${escape(project.statusLabel)}</p><p class="detail-description">${escape(project.description)}</p>${specs(project)}<ul class="amenities">${project.amenities.map(item => `<li>${escape(item)}</li>`).join('')}</ul><p class="detail-note"><strong>Una propuesta a su medida.</strong> Solicite al asesor los planos disponibles y la cotización de la unidad que le interesa. El precio inicial del edificio no representa el precio de todas las tipologías.</p>`);
      $('#detail-contact').attr('data-project', project.id);
      bootstrap.Modal.getOrCreateInstance('#project-modal').show(this);
    });
    $('#detail-contact').on('click', function (event) {
      event.preventDefault();
      const project = getProject($(this).attr('data-project'));
      $('#contact-project').val(project.id);
      $('#contact-message').val(`Quisiera recibir los planos disponibles y una cotización de ${project.name}.`);
      $('#project-modal').one('hidden.bs.modal', focusContact);
      bootstrap.Modal.getInstance('#project-modal').hide();
    });
    $('.schedule-link').on('click', function (event) {
      event.preventDefault(); $('input[name="purpose"][value="Agendar visita"]').prop('checked', true); visitFields(); focusContact();
    });
    $('#advisor-list').on('click', '.advisor-appointment', function (event) {
      event.preventDefault();
      const index = $(this).attr('data-advisor');
      $('#contact-advisor').val(index);
      if (index === '0') { $('input[name="purpose"][value="Agendar visita"]').prop('checked', true); }
      else { $('input[name="purpose"][value="Vivienda propia"]').prop('checked', true); }
      $('#contact-message').val(PRIME.advisors[Number(index)].action + '.');
      visitFields(); focusContact();
    });
    $('input[name="purpose"]').on('change', visitFields);
    $('#contact-form').on('input change', invalidatePreparedMessage);
    $('#contact-name, #contact-phone').on('input', function () { this.setCustomValidity(''); });
    $('#contact-form').on('submit', function (event) {
      event.preventDefault(); invalidatePreparedMessage();
      const name = $('#contact-name').val().trim();
      const phone = $('#contact-phone').val().trim();
      $('#contact-name')[0].setCustomValidity(name.length < 3 ? 'Ingrese su nombre completo.' : '');
      $('#contact-phone')[0].setCustomValidity(/^[+\d\s().-]+$/.test(phone) && phone.replace(/\D/g, '').length >= 8 && phone.replace(/\D/g, '').length <= 15 ? '' : 'Ingrese un teléfono válido.');
      $(this).addClass('was-validated');
      if (!this.checkValidity()) { $(this).find(':invalid').first().trigger('focus'); return; }
      const project = getProject($('#contact-project').val());
      const advisorIndex = $('#contact-advisor').val();
      const advisor = advisorIndex === 'general' ? null : PRIME.advisors[Number(advisorIndex)];
      const message = [
        `Hola${advisor ? ' ' + advisor.name : ''}, soy ${name}. Quisiera información sobre América Prime.`,
        `Teléfono: ${phone}`, `Correo: ${$('#contact-email').val().trim()}`,
        `Proyecto: ${project ? project.name : 'Asesoramiento sobre los 7 edificios'}`,
        `Interés: ${$('input[name="purpose"]:checked').val()}`
      ];
      if (!$('#visit-date').prop('disabled')) message.push(`Fecha preferida de visita: ${$('#visit-date').val()} (por confirmar)`);
      if ($('#contact-message').val().trim()) message.push(`Consulta: ${$('#contact-message').val().trim()}`);
      $('#send-whatsapp').attr('href', whatsapp(advisor?.phone || PRIME.whatsapp, message.join('\n')));
      $('#contact-result').prop('hidden', false);
      document.getElementById('contact-result').scrollIntoView({ block: 'nearest' });
    });
    $('.navbar a[href^="#"]').on('click', function () {
      const menu = document.getElementById('navigation');
      const target = document.getElementById(this.hash.slice(1));
      const close = () => bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
      if (menu.classList.contains('show') || menu.classList.contains('collapsing')) {
        $(menu).one('hidden.bs.collapse', () => target?.scrollIntoView());
        // A quick selection can arrive while Bootstrap is still opening the menu.
        if (menu.classList.contains('collapsing')) $(menu).one('shown.bs.collapse', close);
        else close();
      }
    });
    const sections = ['inicio', 'proyectos', 'asesores', 'ubicacion', 'contacto'].map(id => document.getElementById(id));
    let scheduled = false;
    function updateNavigation() {
      scheduled = false;
      let current = 'inicio';
      sections.forEach(section => { if (section.getBoundingClientRect().top <= 180) current = section.id; });
      $('.navbar .nav-link').each(function () {
        const active = $(this).attr('href') === `#${current}`;
        $(this).toggleClass('active', active);
        if (active) $(this).attr('aria-current', 'page'); else $(this).removeAttr('aria-current');
      });
    }
    $(window).on('scroll', function () { if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); } });
    updateNavigation();
  });
})(jQuery);
