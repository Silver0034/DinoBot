//jimp
exports.profile = function(jimp,
													 message,
													 key,
													 args,
													 EMOJIDINO,
													 attachment,
													 sqldb,
													 target) {
	console.log('1');
	sqldb.query("SELECT * FROM user WHERE userID = " + target.id, function (err, results, fields) {
		var userBackground = results[0].userBackground;
		var rep = '+' + results[0].reputation + 'rep';
		var tagline = results[0].tagline;
		var description = results[0].description;
		//level = y
		//y = 200 * x
		//to find level use:
		//y/200
		console.log('2');
		console.log(userBackground);
		//Assembling the picture
		var userCard = new jimp(800, 500, 0x000000, function (err, image) {
			console.log('2.1');
			//set where the picture will be saved at the end
			attachment = './assets/UserProfile.png';
			if (err) throw err;
			console.log('2.2');
			// Put Plate over Background
			jimp.read(userBackground, function (err, background) {
				console.log('3');
				background.cover(800, 198)
				.blur(1)
				.brightness(-0.2);
				if (err) throw err;
				jimp.read('./assets/profile.png', function (err, plate) {
					console.log('4');
					//XP BAR in image
					//XP Bar Max Width = 517px
					//TODO: Make Width Represent percentage to next level
					var xp = new jimp(517, 11, 0x64FFDAFF, function (err, xp) {
						//Avatar Mask
						//Set default if null
						var avatarPath = './assets/avatarDefault.png';
						if (target.avatarURL != null) {
							avatarPath = target.avatarURL;
						}
						jimp.read('./assets/avatarCircleMask.png', function (err, mask) {
							console.log('5');
							//Avatar
							jimp.read(avatarPath, function (err, avatar) {
								//Assemble Avatar
								avatar.cover(193, 193)
								.mask(mask, 0, 0);
								//Loads Fonts
								console.log('6');
								jimp.loadFont('./assets/fonts/museo-sans-500-16pt-black.fnt').then(function (jimpFontMS16pt500Black) {
									jimp.loadFont('./assets/fonts/museo-sans-900-18pt-white.fnt').then(function (jimpFontMS18pt900White) {
										jimp.loadFont('./assets/fonts/museo-sans-100-24pt-black.fnt').then(function (jimpFontMS24pt100Black) {
											jimp.loadFont('./assets/fonts/museo-sans-700-24pt-black.fnt').then(function (jimpFontMS24pt700Black) {
												jimp.loadFont('./assets/fonts/museo-sans-title-36pt-black.fnt').then(function (jimpFontMS36ptTitleBlack) {
													jimp.loadFont('./assets/fonts/museo-sans-title-36pt-white.fnt').then(function (jimpFontMS36ptTitleWhite) {
														jimp.loadFont('./assets/fonts/museo-sans-title-53pt-black.fnt').then(function (jimpFontMS53ptTitleBlack) {
															//Assemble Image
															console.log('7');
															image
															.composite(background, 0, 0)
															.composite(plate, 0, 0)
															.composite(avatar, 27, 94)
															.composite(xp, 247, 464)
															.print(jimpFontMS36ptTitleWhite, 280, 146, target.username)
															.print(jimpFontMS36ptTitleBlack, 65, 282, rep)
															//limit tagline to 42 characters
															.print(jimpFontMS24pt700Black, 250, 200, tagline, 560)
															//limit description to 126 characters
															.print(jimpFontMS24pt700Black, 250, 250, description, 560)
															.write(attachment, function() {
																message.channel.send(EMOJIDINO + ' ' + target.username + '\'s Profile', {
																	file: attachment
																});
																message.channel.stopTyping();
																return;
															});
														});
													});
												});
											});
										});	
									});
								});
							});
						});
					});
				});
			});
		});
	});
}