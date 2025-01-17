$(document).ready(function() {
    $('.like-button').click(function(e) {
        e.preventDefault();

        var artikelId = $(this).data('idartikel');

        // Ajax request to like/unlike article
        $.ajax({
            url: 'like.php',
            data: { idartikel: artikelId },
            method: 'POST',
            success: function(response) {
                if (response === 'Artikel disukai') {
                    $(this).addClass('liked');
                } else if (response === 'Artikel tidak disukai') {
                    $(this).removeClass('liked');
                } else {
                    alert(response); // Display error message
                }
            }
        });
    });
});
