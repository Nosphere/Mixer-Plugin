//META{"name":"Mixer"}*//
class Mixer
{
    get active() {
        return this._active;
    }

    set active(b) {
        this._active = Boolean(b);
    }

    get config() {
        if(this._config === undefined) {
            this._config = $.extend({
                active: false,
                video: false,
                offline: false,
                current: 0,
                users: {}
            }, bdPluginStorage.get('Plugin', 'config'));
        }
        return this._config;
    }

    set config(s) {
        bdPluginStorage.set('Plugin', 'config', this._config);
    }

    get button() {
        if(this._button === undefined) {
            this._button = $('<button/>', {'class': 'mixer-button', 'type': 'button', 'css': {'order': '-1'}});
            let icon = $('<span/>', {'css': {'background-image': 'url("data:image/svg+xml;base64,' + this.icon + '")'}});
            this._button.append(icon);
        }
        return this._button;
    }

    set button(s) {
        this.button.children().eq(0).css('background-image', 'url("data:image/svg+xml;base64,' + s + '")');
    }

    get dropdown() {
        if(this._dropdown === undefined) {
            this._dropdown = $('<div/>', {'class': 'popout'}); // requires parent classs theme-dark or theme-light
            let wrapper  = $('<div/>', {'class': 'messages-popout-wrap themed-popout'}),
                header   = $('<div/>', {'class': 'header'}),
                title    = $('<div/>', {'class': 'title'}),
                opts     = $('<div/>', {'class': 'options ui-flex flex-horizontal'}),
                scroll   = $('<div/>', {'class': 'scroller-wrap ' + this.theme}), // needs theme class dark/light
                scroller = $('<div/>', {'class': 'scroller messages-popout', 'css': {'max-height': '360px'}}),
                footer   = $('<div/>', {'class': 'footer'});
            this._dropdown.append(wrapper.append(
                header.append(this.createToggle('Mixer Plugin', this.config.active, (evt) => {
                    this.config.active = evt.target.checked;
                    this.config = true;
                    this.button = this.icon;
                    if(this.config.active === true) {
                        this.attach();
                    } else {
                        this.detach();
                    }
                })),
                opts.append(this.createInput('Search...').on('keyup', (evt) => {
                    if(evt.which === 13) {
                        this.checkUser($(evt.target).val());
                    }
                })).css('padding', '10px 20px'),
                scroll.append(scroller),
                footer.append(
                    this.createToggle('Video', this.config.video, (evt) => {
                        this.config.video = evt.target.checked;
                        this.config = true;
                        if(this.config.video === true && $('.mixer-container')[0] !== undefined) {
                            this.mixer.append(this.video);
                        } else if(this.config.video === false && $('.mixer-container')[0] !== undefined) {
                            this.video.remove();
                        }
                    }),
                    this.createToggle('Offline', this.config.offline, (evt) => {
                        this.config.offline = evt.target.checked;
                        this.config = true;
                    })
                ).css({'height': 'auto', 'text-align': 'left'})
            )).toggle();
        }
        return this._dropdown;
    }

    set dropdown(s) {
        if(s === false) {
            this.dropdown.find('.scroller').empty();
        } else {
            this.dropdown.find('.scroller').append(s);
        }
    }

    set notify(s) {
        let notify = $('<div/>', {'css': {
            'width': '70%',
            'position': 'absolute',
            'bottom': '10px',
            'left': $(window).width() / 2,
            'transform': 'translateX(-50%)',
            'background': 'rgba(0,0,0, 0.7)',
            'color': 'white',
            'font-size': '20px',
            'padding': '20px 20px',
            'border-radius': '5px'
        }});
        this.modal.append(notify.text(s));
        setTimeout(() => {
            notify.remove();
        }, 5000);
    }

    get theme() {
        let el = $('div[class*="theme-"]:not(".app")');
        return (el[0] === undefined) ? 'dark' : el.attr('class').replace('theme-', '');
    }

    get toolbar() {
        return $('.header-toolbar');
    }

    get modal() {
        return $('#app-mount > * > div[class*="theme-"]');
    }

    get icon() {
        return (this.config.active === true) ? this.logo : (this.theme === 'dark') ? this.white : this.black;
    }

    get black() {
        return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGQ9Ik0xMTYuMDMsNzcuNjhjLTE1Ljc2LTIxLjI5LTQ2LjcyLTI0LjYxLTY2LjkxLTYuMzZjLTE3LjQyLDE2LjA0LTE4LjgsNDMuMTMtNC43LDYyLjIxbDkwLjk2LDEyMS45Mkw0My44NywzNzguNDhjLTE0LjEsMTkuMDgtMTIuOTksNDYuMTcsNC43LDYyLjIxYzIwLjE4LDE4LjI1LDUxLjE1LDE0LjkzLDY2LjkxLTYuMzZsMTI3LjczLTE3MS42OWMzLjA0LTQuMTUsMy4wNC05Ljk1LDAtMTQuMUwxMTYuMDMsNzcuNjh6Ii8+PHBhdGggZD0iTTM5Ni4zNyw3Ny42OGMxNS43Ni0yMS4yOSw0Ni43Mi0yNC42MSw2Ni45MS02LjM2YzE3LjQyLDE2LjA0LDE4LjgsNDMuMTMsNC43LDYyLjIxbC05MC45NiwxMjEuOTJsOTEuNTEsMTIzLjAzYzE0LjEsMTkuMDgsMTIuOTksNDYuMTctNC43LDYyLjIxYy0yMC4xOCwxOC4yNS01MS4xNSwxNC45My02Ni45MS02LjM2TDI2OS40NywyNjIuMzZjLTMuMDQtNC4xNS0zLjA0LTkuOTUsMC0xNC4xTDM5Ni4zNyw3Ny42OHoiLz48L3N2Zz4=';
    }

    get white() {
        return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiNGRkZGRkY7fTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTExNi4wMyw3Ny42OGMtMTUuNzYtMjEuMjktNDYuNzItMjQuNjEtNjYuOTEtNi4zNmMtMTcuNDIsMTYuMDQtMTguOCw0My4xMy00LjcsNjIuMjFsOTAuOTYsMTIxLjkyTDQzLjg3LDM3OC40OGMtMTQuMSwxOS4wOC0xMi45OSw0Ni4xNyw0LjcsNjIuMjFjMjAuMTgsMTguMjUsNTEuMTUsMTQuOTMsNjYuOTEtNi4zNmwxMjcuNzMtMTcxLjY5YzMuMDQtNC4xNSwzLjA0LTkuOTUsMC0xNC4xTDExNi4wMyw3Ny42OHoiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzk2LjM3LDc3LjY4YzE1Ljc2LTIxLjI5LDQ2LjcyLTI0LjYxLDY2LjkxLTYuMzZjMTcuNDIsMTYuMDQsMTguOCw0My4xMyw0LjcsNjIuMjFsLTkwLjk2LDEyMS45Mmw5MS41MSwxMjMuMDNjMTQuMSwxOS4wOCwxMi45OSw0Ni4xNy00LjcsNjIuMjFjLTIwLjE4LDE4LjI1LTUxLjE1LDE0LjkzLTY2LjkxLTYuMzZMMjY5LjQ3LDI2Mi4zNmMtMy4wNC00LjE1LTMuMDQtOS45NSwwLTE0LjFMMzk2LjM3LDc3LjY4eiIvPjwvc3ZnPg==';
    }

    get logo() {
        return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiMwMzIxNEY7fS5zdDF7ZmlsbDojMUZCQUVEO308L3N0eWxlPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMTYuMDMsNzcuNjhjLTE1Ljc2LTIxLjI5LTQ2LjcyLTI0LjYxLTY2LjkxLTYuMzZjLTE3LjQyLDE2LjA0LTE4LjgsNDMuMTMtNC43LDYyLjIxbDkwLjk2LDEyMS45Mkw0My44NywzNzguNDhjLTE0LjEsMTkuMDgtMTIuOTksNDYuMTcsNC43LDYyLjIxYzIwLjE4LDE4LjI1LDUxLjE1LDE0LjkzLDY2LjkxLTYuMzZsMTI3LjczLTE3MS42OWMzLjA0LTQuMTUsMy4wNC05Ljk1LDAtMTQuMUwxMTYuMDMsNzcuNjh6Ii8+PHBhdGggY2xhc3M9InN0MSIgZD0iTTM5Ni4zNyw3Ny42OGMxNS43Ni0yMS4yOSw0Ni43Mi0yNC42MSw2Ni45MS02LjM2YzE3LjQyLDE2LjA0LDE4LjgsNDMuMTMsNC43LDYyLjIxbC05MC45NiwxMjEuOTJsOTEuNTEsMTIzLjAzYzE0LjEsMTkuMDgsMTIuOTksNDYuMTctNC43LDYyLjIxYy0yMC4xOCwxOC4yNS01MS4xNSwxNC45My02Ni45MS02LjM2TDI2OS40NywyNjIuMzZjLTMuMDQtNC4xNS0zLjA0LTkuOTUsMC0xNC4xTDM5Ni4zNyw3Ny42OHoiLz48L3N2Zz4=';
    }

    get text() {
        return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNzEyIDIyMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNzEyIDIyMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiNGRkZGRkY7fS5zdDF7ZmlsbDojMUZCQUVEO308L3N0eWxlPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNTcsNjcuM2MtOSwwLTE2LjQsNy4zLTE2LjQsMTYuNHYxMTcuN2MwLDIuNCwxLjksNC4zLDQuMyw0LjNoMjQuMmMyLjQsMCw0LjMtMS45LDQuMy00LjNWODMuN0MyNzMuNCw3NC42LDI2Ni4xLDY3LjMsMjU3LDY3LjMiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTY5LjQsNjcuNGMtMjAuMSwwLTM0LDguMy00NC4zLDI0LjJjLTEzLjctMzIuNC02MC40LTMxLjctNzkuOC0xLjlDNDIuMyw3NywzMSw2Ny42LDE3LjUsNjcuNmgtNC4xYzAsMjUuMSwwLDEwNC44LDAsMTMzLjhjMCwyLjQsMS45LDQuMyw0LjMsNC4zaDI0LjJjMi40LDAsNC4zLTEuOSw0LjMtNC4zVjEzMGMwLTE4LDguNi0zNS40LDI2LjQtMzUuNGMxNi42LDAsMjQuNiwxMC42LDI0LjYsMzIuNHY3NC4zYzAsMi40LDEuOSw0LjMsNC4zLDQuM2gyNC4yYzIuNCwwLDQuMy0xLjksNC4zLTQuM1YxMzBjMC0xNy4xLDkuNi0zNS40LDI2LjQtMzUuNGMyMC43LDAsMjQuOSwxNCwyNC45LDM1djcxLjhjMCwyLjQsMS45LDQuMyw0LjMsNC4zaDI0LjNjMi40LDAsNC4zLTEuOSw0LjMtNC4zdi03OC44QzIxNC4xLDg5LjIsMjAyLjMsNjcuNCwxNjkuNCw2Ny40Ii8+PHBhdGggY2xhc3M9InN0MCIgZD0iTTMyOS41LDczLjVjLTUuNy03LjctMTYuOS04LjktMjQuMi0yLjNjLTYuMyw1LjgtNi44LDE1LjYtMS43LDIyLjVsMzIuOSw0NC4xbC0zMy4xLDQ0LjVjLTUuMSw2LjktNC43LDE2LjcsMS43LDIyLjVjNy4zLDYuNiwxOC41LDUuNCwyNC4yLTIuM2w0Ni4yLTYyLjFjMS4xLTEuNSwxLjEtMy42LDAtNS4xTDMyOS41LDczLjV6Ii8+PHBhdGggY2xhc3M9InN0MSIgZD0iTTQzMC45LDczLjVjNS43LTcuNywxNi45LTguOSwyNC4yLTIuM2M2LjMsNS44LDYuOCwxNS42LDEuNywyMi41bC0zMi45LDQ0LjFsMzMuMSw0NC41YzUuMSw2LjksNC43LDE2LjctMS43LDIyLjVjLTcuMyw2LjYtMTguNSw1LjQtMjQuMi0yLjNMMzg1LDE0MC4zYy0xLjEtMS41LTEuMS0zLjYsMC01LjFMNDMwLjksNzMuNXoiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNNTE5LDEwMi4yYzUuNy01LjcsMTIuNC04LjYsMjAuMS04LjZjOC40LDAsMTUsMi42LDE5LjcsNy44YzQuNCw1LDYuOCwxMi4yLDcsMjEuNmgtNTcuM0M1MTAuMSwxMTQuNiw1MTMuNywxMDcuNiw1MTksMTAyLjIgTTU3Mi4xLDE4MC4yYy0xLTEuMy0yLjctMS44LTQuMi0xLjNjMCwwLDAsMCwwLDBjLTE3LjEsNS45LTU2LjYsOS40LTU5LjUtMzAuNmg3NS42YzguMSwwLDE0LjYtNi41LDE0LjYtMTQuNmMwLTE4LjEtMy4zLTM1LjYtMTUuNi00OS4xYy0zMC4xLTMzLjMtMTA4LjItMjAuNy0xMDguMiw1NC44YzAsNzguMyw3My4yLDc2LjYsMTA2LjQsNjEuNGMyLjUtMS4xLDMuMi00LjMsMS42LTYuNEw1NzIuMSwxODAuMnoiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNNjk3LjUsNjkuNEw2OTcuNSw2OS40Yy01LjgtMS42LTE1LjItMS4yLTE4LjItMC42Yy0xMS43LDMuNS0yMC4zLDExLjUtMjUuNSwyMy42Yy0xLjgtMTQtMTMuOC0yNC44LTI4LjMtMjQuOGgtNC4yYzAsMjUuMSwwLDEwNC45LDAsMTMzLjhjMCwyLjQsMS45LDQuMyw0LjMsNC4zaDI0LjJjMi40LDAsNC4zLTEuOSw0LjMtNC4zdi02NC44YzAtMjYuOCwxNS4xLTQ1LjYsNDAuNy0zNi4xYzIuOCwxLDUuOC0xLDUuOC00VjczLjZDNzAwLjcsNzEuNyw2OTkuMyw2OS45LDY5Ny41LDY5LjQiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjM5LjUsMjYuNWMwLDkuNyw3LjksMTcuNSwxNy42LDE3LjVzMTcuNS03LjksMTcuNS0xNy41UzI2Ni43LDksMjU3LDlTMjM5LjUsMTYuOSwyMzkuNSwyNi41Ii8+PC9zdmc+';
    }

    /**
     * @return string Mixer embed url
     */
    get embed() {
        return 'https://mixer.com/embed/{{EMBED}}/{{ID}}';
    }

    /**
     * @return jQuery returns embed container element as jQuery object
     */
    get mixer() {
        if(this._mixer === undefined) {
            this.mixer = this.config.current;
        }
        return this._mixer;
    }

    /**
     * Creates mixer embed container and sets chat and video IDs
     * @param int id User id to embed
     */
    set mixer(id) {
        this.config.current = id || this.config.current;
        if(this._mixer === undefined) {
            let container = $('<div/>', {'class': 'mixer-container ui-flex flex-vertical'}),
                logo      = $('<div/>', {'css': {'min-height': '32px', 'flex': '0 0 0%', 'background-repeat': 'no-repeat', 'background-attachement': 'fixed', 'background-position': 'center', 'background-color': '#141828', 'background-image': 'url("data:image/svg+xml;base64,' + this.text + '")'}});

            this._mixer = container.append(logo, this.chat.attr('src', id));
        } else {
            this.chat.attr('src', id);
            this.video.attr('src', id);
        }
    }

    /**
     * @return jQuery Returns jQuery object for the video iframe
     */
    get video() {
        if(this._video === undefined) {
            this._video = $('<iframe/>', {'css': {'height': '25%'}});
            this._video.attr('src', this.embed.replace('{{EMBED}}', 'player').replace('{{ID}}', this.config.current));
        }
        return this._video;
    }

    /**
     * Sets the url for the video embed
     * @param int id User ID
     */
    set video(id) {
        this.video.attr('src', this.embed.replace('{{EMBED}}', 'player').replace('{{ID}}', id));
    }

    /**
     * @return jQuery Returns jQuery object for the chat iframe
     */
    get chat() {
        if(this._chat === undefined) {
            this._chat = $('<iframe/>', {'css': {'flex': '1'}});
        }
        return this._chat;
    }

    /**
     * Sets the url for the chat embed
     * @param int id User ID
     */
    set chat(id) {
        this.chat.attr('src', this.embed.replace('{{EMBED}}', 'chat').replace('{{ID}}', id));
    }

    get github() {
        return 'https://raw.githubusercontent.com/Nosphere/Mixer-Plugin/master/{{FILE}}?now=1496035380197';
    }

    createCard(user) {
        let stat = (user.online === false) ? 'invisible' : 'online';
        let container = $('<div/>', {'class': 'channel-members message-group hide-overflow', 'css': {'max-width': '100%', 'cursor': 'pointer'}}),
            avatar  = $('<div/>', {'class': 'avatar-small'}),
            status  = $('<div/>', {'class': 'status status-' + stat}),
            comment = $('<div/>', {'class': 'comment'}),
            message = $('<div/>', {'class': 'message'}),
            buttons = $('<div/>', {'class': 'action-buttons'}),
            remove  = $('<span/>', {'class': 'close-button'}),
            body    = $('<div/>', {'class': 'body'}),
            header  = $('<h2/>'),
            name    = $('<span/>', {'class': 'username-wrapper'}),
            stamp   = $('<span/>', {'class': 'timestamp'}),
            text    = $('<div/>', {'class': 'message-text markup', 'css': {'font-size': '90%', 'line-height': '1.1'}});
        let clr = (user.featured === true) ? 'color: rgb(31, 186, 237)' : '';
        container.append(
            avatar.append(status).css('background-image', 'url("' + user.user.avatarUrl + '")'),
            comment.append(message.append(
                body.append(header.append(
                    name.html('<strong style="text-transform:none;' + clr + '">' + user.user.username + '</strong>')
                )),
                text.text(user.name)
            )),
            buttons.append(remove.on('click', (evt) => {
                container.remove();
                delete this.config.users[user.user.username];
                this.config.current = 0;
                this.config = true;
            })
        )).on('click', (evt) => {
            this.config.current = user.id;
            this.chat = this.config.current;
            this.video = this.config.current;
            this.dropdown.toggle();

        });
        return container;
    }

    createToggle(_title, _checked, _callback) {
        let container = $('<div/>', {'class': 'ui-flex flex-horizontal'}),
            title     = $('<h3/>', {'class': 'ui-form-title h3 ui-flex-child'}),
            label     = $('<label/>', {'class': 'ui-switch-wrapper ui-flex-child'}),
            check     = $('<input/>', {'class': 'ui-switch-checkbox', 'type': 'checkbox', 'checked': _checked}),
            button    = $('<div/>', {'class': 'ui-switch'});
        container.append(
            title.text(_title),
            label.append(check.on('change', _callback), button)
        ).css('margin', '0px 10px 0px 10px').css('flex', '1 1 100%');
        return container;
    }

    createInput(_placeholder, _callback) {
        let container = $('<div/>', {'class': 'ui-input-button'}),
            wrapper   = $('<div/>', {'class': 'ui-flex flex-horizontal layout'}),
            input     = $('<input/>', {'class': 'input', 'type': 'text'});
        container.append(
            input.css('flex', '1 1 auto').attr('placeholder', _placeholder)
        ).css('flex', '1 1 auto');
        return container;
    }

    checkUser(name) {
        name = name;
        $.get('https://mixer.com/api/v1/channels?where=token:in:' + name, {cache: $.now()}, (data) => {
            if(data.length === 0) {
                this.notify = 'Failed to get user data for user: ' + name;
            } else {
                for(let i in data) {
                    this.config.users = $.extend(this.config.users, {[data[i].user.username]: data[i]});
                    if(this.config.offline === true && data[i].online === false) {
                        continue;
                    } else {
                        this.dropdown = this.createCard(data[i]);
                    }
                }
                this.config = true;
            }
        }, 'json');
    }

    /**
     * Attaches mixer embed container
     * @param int id
     */
    attach(id) {
        this.config.current = id || this.config.current;
        if(this.config.active) {
            $('.content').append(this.mixer);
            this.chat = this.config.current;
            if(this.config.video) {
                this.mixer.append(this.video);
                this.video = this.config.current;
            }
        }
    }

    /**
     * Removes the mixer container
     */
    detach() {
        this.mixer.remove();
    }

    /**
     * Shorthand function for Core.prototype.alert
     * @param string message
     */
    alert(title, str) {
        Core.prototype.alert(this.getName() + ': ' + title, '' + str + '');
    }

    updateCheck() {
        let current = this.getVersion().split('.');
        $.get(this.github.replace('{{FILE}}', 'version.json'), {'now': $.now()} , (data) => {
        }, 'json').done((data) => {
            let up = data.version.split('.');
            for(let i in up) {
                if(parseInt(up[i]) > parseInt(current[i])) {
                    let str = 'A new version of ' + this.getName() + ' plugin is available, <a href="' + this.github.replace('{{FILE}}', this.getName() + '.plugin.js') + '" download>Download v' + data.version + '</a>';
                        str += '<h3 class="h5">To Do:</h3><ul>';
                    for(let n in data.notes.todo) {
                        str += '<li>' + data.notes.todo[n] + '</li>';
                    }
                        str += '</ul><h3 class="h5">Changes:</h3><ul>';
                    for(let n in data.notes.changes) {
                        str += '<li>' + data.notes.changes[n] + '</li>';
                    }
                        str += '</ul><h3 class="h5">Fixes:</h3><ul>';
                    for(let n in data.notes.fixes) {
                        str += '<li>' + data.notes.fixes[n] + '</li>';
                    }
                        str += '</ul><h3 class="h5">Known Issues:</h3><ul>';
                    for(let n in data.notes.issues) {
                        str += '<li>' + data.notes.issues[n] + '</li>';
                    }
                        str += '</ul><h3 class="h5">Special thanks:</h3><ul>';
                    for(let n in data.notes.credits) {
                        str += '<li>' + data.notes.credits[n] + '</li>';
                    }
                        str += '</ul>';
                    this.alert('Update Available', str);
                }
            }
        }).fail((err) => {
            this.alert('Update Check', 'Failed to check for updates!');
        });
    }

    observer() {
        this.button = this.icon;
        if($('.mixer-button')[0] === undefined && this.toolbar[0] !== undefined) {
            this.toolbar.prepend(this.button);
        }

        if(this.config.users.length > 0 && this.config.current === 0) {
            this.config.current = this.config.users[Object.keys(this.config.users)[0]].id;
        }

        if(this.config.active && $('.mixer-container')[0] === undefined) {
            this.attach();
        } else if(this.config.active === false && $('.mixer-container')[0] !== undefined) {
            this.detach();
        }
    }

    load() {
        this.updateCheck();
    }

    unload() {
        this.config = true; // save config
    }

    start() {
        this.button = this.icon;
        this.toolbar.prepend(this.button.on('click', (evt) => {
            this.dropdown = false;
            this.modal.append(this.dropdown.toggle());
            this.dropdown.css({
                top: this.button.offset().top + this.button.height(),
                left: this.button.offset().left - (this.dropdown.width() - this.button.width())
            });

            for(let name in this.config.users) {
                if(this.config.offline === true && this.config.users[name].online === false) {
                    continue;
                } else {
                    this.dropdown = this.createCard(this.config.users[name]);
                }
            }
        }));

        this._update = setInterval(() => {
            this.checkUser(Object.keys(this.config.users).join(';'));
        }, (60 * 1000) * 3);
    }

    stop() {
        this.button.remove();
        clearInterval(this._update);
    }

    getName() {
        return 'Mixer';
    }

    getVersion() {
        return '0.3.2';
    }

    getDescription() {
        return 'Attaches Mixer.com chat and optionally video directly to discord, enabling stream participation from within discord.';
    }

    getAuthor() {
        return 'Ve';
    }
}
