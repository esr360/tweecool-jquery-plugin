/*Name : TweeCool
 *version: 1.0.0
 *Description: Get the latest tweets from twitter.
 *Website: www.tweecool.com
 *Licence: No licence, feel free to do whatever you want.
 *Author: TweeCool
 */

(function($) {
    
    $.fn.extend({

        tweecool: function(options) {

            var defaults = {
                username: 'esr360',
                limit: 5,
                profile_image: true,
                show_time: true,
                show_media: false,
                show_media_size: 'thumb', //values: small, large, thumb, medium 
                show_actions: false,
                action_reply_icon: '&crarr;',
                action_retweet_icon: '&prop;',
                action_favorite_icon: '&#9733;',
                profile_img_url: 'profile', //Values: profile, tweet 
                show_retweeted_text: false //This will show the original tweet in order to avoid any truncated text, and also the "RT @tweecool:" is removed which helps with 140 character limit

            }

            var options = $.extend(defaults, options);

            function xTimeAgo(time) {
                
                var nd = new Date();
                //var gmtDate = Date.UTC(nd.getFullYear(), nd.getMonth(), nd.getDate(), nd.getHours(), nd.getMinutes(), nd.getMilliseconds());
                var gmtDate = Date.parse(nd);
                var tweetedTime = time * 1000; //convert seconds to milliseconds
                var timeDiff = (gmtDate - tweetedTime) / 1000; //convert milliseconds to seconds

                var second = 1,
                    minute = 60,
                    hour = 60 * 60,
                    day = 60 * 60 * 24,
                    week = 60 * 60 * 24 * 7,
                    month = 60 * 60 * 24 * 30,
                    year = 60 * 60 * 24 * 365;

                if (timeDiff > second && timeDiff < minute) {
                    return Math.round(timeDiff / second) + " seconds ago";
                } else if (timeDiff >= minute && timeDiff < hour) {
                    return Math.round(timeDiff / minute) + " minutes ago";
                } else if (timeDiff >= hour && timeDiff < day) {
                    return Math.round(timeDiff / hour) + " hours ago";
                } else if (timeDiff >= day && timeDiff < week) {
                    return Math.round(timeDiff / day) + " days ago";
                } else if (timeDiff >= week && timeDiff < month) {
                    return Math.round(timeDiff / week) + " weeks ago";
                } else if (timeDiff >= month && timeDiff < year) {
                    return Math.round(timeDiff / month) + " months ago";
                } else {
                    return 'over a year ago';
                }

            }

            return this.each(function() {
                
                var o = options;
                var wrapper = $(this);
                var wInner = $('<ul class="tweets">').appendTo(wrapper);
                var urlpattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                var usernamepattern = /@+(\w+)/ig;
                var hashpattern = /#+(\w+)/ig;
                var pIMG, media, timestamp, abox, mtext;

				$.getJSON("http://tweecool.com/api/?screenname=" + o.username + "&count=" + o.limit, function(data) {

                    if (data.errors || data == null) {
                        wrapper.html('No tweets available.');
                        return false;
                    }

                    $.each(data.tweets, function(i, field) {

                        if (o.profile_image) {
                            if (o.profile_img_url == 'tweet') {
                                pIMG = '<a class="tweet-avatar" href="https://twitter.com/' + o.username + '/status/' + field.id_str + '" target="_blank"><img src="' + data.user.profile_image_url + '" alt="' + o.username + '" /></a>';
                            } else {
                                pIMG = '<a class="tweet-avatar" href="https://twitter.com/' + o.username + '" target="_blank"><img src="' + data.user.profile_image_url + '" alt="' + o.username + '" /></a>';
                            }
                        } else {
                            pIMG = '';
                        }

                        if (o.show_time) {
                            timestamp = xTimeAgo(field.timestamp);
                        } else {
                            timestamp = '';
                        }

                        if (o.show_media && field.media_url) {
                            media = '<a href="https://twitter.com/' + o.username + '/status/' + field.id_str + '" target="_blank"><img src="' + field.media_url + ':' + o.show_media_size + '" alt="' + o.username + '" class="media" /></a>';
                        } else {
                            media = '';
                        }

                        if (o.show_actions) {
                            
                            abox = '<ul class="tweet-actions">';
                            
                            // reply icon
                            abox += '<li class="tweet-reply"><a title="Reply" target="blank" href="https://twitter.com/intent/tweet?in_reply_to=' + field.id_str + '">' + o.action_reply_icon + '</a></li>';
                            
                            // retweet icon
                            abox += '<li class="retweet"><a title="Retweet" target="blank" href="https://twitter.com/intent/retweet?tweet_id=' + field.id_str + '">' + o.action_retweet_icon + (field.retweet_count_f != '' ? '<span class="retween-count"> ' + field.retweet_count_f + '</span>' : '') + '</a>' + '</li>';
                            
                            // favourite iicon
                            abox += '<li class="tweet-favorite"><a title="Favorite" target="blank" href="https://twitter.com/intent/favorite?tweet_id=' + field.id_str + '">' + o.action_favorite_icon + (field.favorite_count_f != '' ? '<span class="favourite-count"> ' + field.favorite_count_f + '</span>' : '') + '</a>' + '</li>';
                            
                            abox += '</ul>';
                            
                        } else {
                            abox = '';
                        }

                        if (o.show_retweeted_text && field.retweeted_text) {
                            mtext = field.retweeted_text;
                        } else {
                            mtext = field.text;
                        }

                        wInner.append(
                            '<li class="tweet">' + 
                                pIMG + 
                                '<div class="tweet-content">' + 
                                    '<p class="tweet-text">' + 
                                        mtext.replace(urlpattern, '<a href="$1" target="_blank">$1</a>')
                                        .replace(usernamepattern, '<a href="https://twitter.com/$1" target="_blank">@$1</a>')
                                        .replace(hashpattern, '<a href="https://twitter.com/search?q=%23$1" target="_blank">#$1</a>') + media +
                                        '<span class="tweet-timestamp"> - ' + timestamp + '</span>' +  
                                    '</p>' + 
                                    '<span class="tweet-meta">' +
                                        pIMG + 
                                        '<a class="tweet-user" href="https://twitter.com/' + o.username + '" target="blank">@' + o.username + '</a>' + 
                                    '</span>' +
                                    abox + 
                                '</div>' +
                            '</li>'
                        );
                        
                    });

                }).fail(function(jqxhr, textStatus, error) {
                    //var err = textStatus + ', ' + error;
                    wrapper.html('No tweets available');
                });

            });

        } // tweecool
        
    }); // fn.extend

})(jQuery);