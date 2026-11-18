// Đánh giá là dữ liệu demo riêng trong trình duyệt, liên kết với PhieuDatPhong đã trả phòng.
(() => {
    const STORAGE_KEY = 'SSA_Reviews_v1';
    let selectedRating = 0;

    function readReviews() {
        try {
            const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function completedBookings() {
        return docDuLieu('PhieuDatPhong').filter(booking => booking.TrangThai === 'Đã trả phòng');
    }

    function verifiedReviews(bookings) {
        const bookingById = new Map(bookings.map(booking => [booking.MaPDP, booking]));
        const seen = new Set();
        return readReviews().filter(review => {
            const booking = bookingById.get(review.MaPDP);
            const valid = booking && booking.MaKH === review.MaKH &&
                Number.isInteger(review.SoSao) && review.SoSao >= 1 && review.SoSao <= 5 &&
                !seen.has(review.MaPDP);
            if (valid) seen.add(review.MaPDP);
            return valid;
        });
    }

    function setRating(value) {
        selectedRating = value;
        document.querySelectorAll('#review-stars button').forEach(button => {
            const rating = Number(button.dataset.rating);
            button.classList.toggle('is-active', rating <= value);
            button.setAttribute('aria-pressed', String(rating === value));
        });
    }

    function renderReviews() {
        const bookings = completedBookings();
        const reviews = verifiedReviews(bookings).sort((a, b) => String(b.NgayDanhGia).localeCompare(String(a.NgayDanhGia)));
        const list = document.getElementById('reviews-list');
        const average = document.getElementById('reviews-average');
        const count = document.getElementById('reviews-count');
        if (!list) return;

        list.replaceChildren();
        const score = reviews.length ? reviews.reduce((sum, review) => sum + review.SoSao, 0) / reviews.length : 0;
        average.textContent = reviews.length ? score.toFixed(1) : '—';
        document.querySelector('.reviews-summary-stars').textContent = '★'.repeat(Math.round(score)) + '☆'.repeat(5 - Math.round(score));
        count.textContent = reviews.length ? `${reviews.length} đánh giá từ lượt lưu trú` : 'Chưa có đánh giá';
        if (!reviews.length) {
            const empty = document.createElement('p');
            empty.className = 'reviews-empty';
            empty.textContent = 'Chưa có đánh giá từ lượt lưu trú đã hoàn tất. Sau khi trả phòng, khách có thể chia sẻ cảm nhận và chấm từ 1 đến 5 sao.';
            list.append(empty);
        }

        reviews.slice(0, 3).forEach(review => {
            const booking = bookings.find(item => item.MaPDP === review.MaPDP);
            const card = document.createElement('article');
            card.className = 'review-card';
            const top = document.createElement('div');
            top.className = 'review-card-top';
            const stars = document.createElement('span');
            stars.className = 'review-card-stars';
            stars.setAttribute('aria-label', `${review.SoSao} trên 5 sao`);
            stars.textContent = '★'.repeat(review.SoSao) + '☆'.repeat(5 - review.SoSao);
            const date = document.createElement('time');
            date.dateTime = String(review.NgayDanhGia || '').slice(0, 10);
            date.textContent = date.dateTime;
            top.append(stars, date);
            card.append(top);
            if (review.NhanXet) {
                const comment = document.createElement('p');
                comment.textContent = review.NhanXet;
                card.append(comment);
            }
            const info = document.createElement('small');
            info.textContent = `Khách đã lưu trú · ${timLoaiPhong(booking.MaLoaiPhong)?.TenLoai || 'SSA Hotel'}`;
            card.append(info);
            list.append(card);
        });

        const user = docDuLieu('CurrentUser', null);
        const form = document.getElementById('review-form');
        const invite = document.getElementById('review-invite');
        const available = user ? bookings.filter(booking => booking.MaKH === user.MaKH && !reviews.some(review => review.MaPDP === booking.MaPDP)) : [];
        form.hidden = !available.length;
        invite.textContent = !user ? 'Đăng nhập để đánh giá sau khi hoàn tất kỳ lưu trú.' :
            available.length ? '' : 'Bạn có thể gửi một đánh giá cho mỗi lượt lưu trú sau khi trả phòng.';
        const select = document.getElementById('review-booking');
        select.replaceChildren(...available.map(booking => {
            const option = document.createElement('option');
            option.value = booking.MaPDP;
            option.textContent = `${timLoaiPhong(booking.MaLoaiPhong)?.TenLoai || 'Phòng SSA'} · trả phòng ${booking.NgayTraDuKien}`;
            return option;
        }));
    }

    function submitReview(event) {
        event.preventDefault();
        const feedback = document.getElementById('review-feedback');
        const user = docDuLieu('CurrentUser', null);
        const bookingId = document.getElementById('review-booking').value;
        const booking = completedBookings().find(item => item.MaPDP === bookingId && item.MaKH === user?.MaKH);
        const reviews = readReviews();
        if (!booking || reviews.some(item => item.MaPDP === bookingId) || !selectedRating) {
            feedback.textContent = 'Vui lòng chọn lượt lưu trú hợp lệ và chấm từ 1 đến 5 sao.';
            return;
        }
        reviews.push({ MaPDP: bookingId, MaKH: user.MaKH, SoSao: selectedRating,
            NhanXet: document.getElementById('review-comment').value.trim().slice(0, 600),
            NgayDanhGia: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        document.getElementById('review-form').reset();
        setRating(0);
        renderReviews();
        document.getElementById('review-invite').textContent = 'Cảm ơn bạn đã chia sẻ đánh giá.';
    }

    window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('#review-stars button').forEach(button => button.addEventListener('click', () => setRating(Number(button.dataset.rating))));
        document.getElementById('review-form')?.addEventListener('submit', submitReview);
        renderReviews();
    });
    window.addEventListener('ssa-auth-change', renderReviews);
    window.addEventListener('storage', event => {
        if (['CurrentUser', 'PhieuDatPhong', STORAGE_KEY].includes(event.key)) renderReviews();
    });
})();
