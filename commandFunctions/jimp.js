//jimp
exports.profile = function(Jimp,
													 jimpUserCardBlank,
													 userBackground,
													 jimpFontMS16pt500Black,
													 jimpFontMS18pt900White,
													 jimpFontMS24pt100Black,
													 jimpFontMS24pt700Black,
													 jimpFontMS36ptTitleBlack,
													 jimpFontMS36ptTitleWhite,
													 jimpFontMS53ptTitleBlack,
													 message,
													 key,
													 args) {
	Jimp.read('assets/profile.png', function (err, image) {
		console.log('IT RUNS THE COMMAND');
		if (err) throw err;
			//517 is the full xp bar. Pick a number between 1 and 517
			var xp = new Jimp(517, 11, 0x64FFDAFF, function (err, xp) {
				attachment = './assets/userProfile.' + image.getExtension();
				image
					.print(jimpFontMS36ptTitleWhite, 280, 146, message.author.username, 500)
					.composite(xp, 247, 464)
					.write(attachment, function() {
						message.channel.send(emojiDino + ' ' + message.author.username + '\'s Profile', {
							file: attachment
						});
						message.channel.stopTyping();
					});
			});
	});
}