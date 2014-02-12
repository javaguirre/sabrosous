/** @jsx React.DOM */
var Link = React.createClass({
    getInitialState: function() {
        return {data: this.props.data,
                edit: 'none'};
    },
    deleteObj: function() {
        this.props.onDelete(this.state.data.key);
    },
    toggleEdit: function(elem) {
        if(elem.contentEditable == "true") {
            elem.contentEditable = false;
            elem.className.replace(' editing', '');
        }
        else {
            elem.contentEditable = true;
            elem.className += ' editing';
        }
    },
    editObj: function() {
        var title_elem = this.refs.title.getDOMNode();
        var tags_elem = this.refs.tags.getDOMNode();

        this.toggleEdit(title_elem);
        this.toggleEdit(tags_elem);

        $(tags_elem).tagsinput();

        this.state.data.tags.forEach(function(tag) {
            $(tags_elem).tagsinput('add', tag.state.data.slug);
        });
    },
    saveObj: function() {
        var tags_elem = this.refs.tags.getDOMNode();
        var title_elem = this.refs.title.getDOMNode();
        var title = title_elem.textContent.trim();
        var tags = $(tags_elem).tagsinput('items');

        this.toggleEdit(title_elem);
        this.toggleEdit(tags_elem);
        $(tags_elem).tagsinput('destroy');

        data = {
            tags: tags,
            title: title
        }

        $.ajax({
            type: 'PATCH',
            url: '/api/links/' + this.state.data.id + '/',
            data: data,
            headers: {'X-CSRFToken': $.cookie('csrftoken')},
            success: function(result) {
                var handleTag = function() {};
                var tags = result.tags.map(function(tag) {
                    return <Tag data={tag}
                                handleTag={handleTag} />;
                });
                result.tags = tags;

                this.setState({data: result});
            }.bind(this)
        });
    },
    render: function() {
        var pub_date = moment(this.state.data.pub_date).calendar();
        var uri_obj = parseUri(this.state.data.url);
        var domain = uri_obj.host;
        var domain_url = uri_obj.protocol + '://' + domain;

        return (
            <div ref="item" data-id={this.state.data.id}
                 className="row link-block well">
                <div className="col-md-11">
                    <div>
                        <a href={this.state.data.url} className="link-title"
                           ref="title">
                            {this.state.data.title}
                        </a>
                        <a href={domain_url} className="link-title">{domain}</a>
                    </div>

                    <div>
                        <span ref="tags">{this.state.data.tags}</span> <span className="pull-right">{pub_date}</span>
                    </div>
                </div>
                <div className="col-md-1">
                    <div>
                        <a href="#edit" onClick={this.saveObj}>
                            <span className="glyphicon glyphicon-hdd"></span>
                        </a>
                        <a href="#edit" onClick={this.editObj}>
                            <span className="glyphicon glyphicon-pencil edit-obj"></span>
                        </a>
                        <a href="#delete" onClick={this.deleteObj}>
                            <span className="glyphicon glyphicon-remove delete-obj"></span>
                        </a>
                    </div>
                </div>
            </div>
        )
    }
});

var Tag = React.createClass({
    getInitialState: function() {
        return {data: this.props.data};
    },
    onTagClick: function() {
        this.props.handleTag(this.state.data.slug);
    },
    render: function() {
        var hash = '#' + this.state.data.slug;

        return (
            <a href={hash} className="tag small" onClick={this.onTagClick}>{this.state.data.name}</a>
        )
    }
});

var LinkForm = React.createClass({
    getInitialState: function() {
        return {add: 'none'};
    },
    componentDidMount: function() {
        $('input[name="tags"]').tagsinput();
    },
    toggleAdd: function() {
        var add = 'none';

        if(this.state.add == 'none') {
            add = 'block';
        }

        this.setState({add: add});
    },

    addObj: function() {
        var url = this.refs.url.getDOMNode().value.trim();
        this.props.onSubmit(url);
    },

    render: function() {
        return (
            <div className="link-add">
                <a href="#add" onClick={this.toggleAdd}>Add</a>

                <div style={{display: this.state.add}}>
                    <input type="text" ref="url" />
                    <input type="text" name="title" ref="title" />
                    <input type="text" name="tags" ref="tags" data-role="tagsinput" />
                    <input type="button" onClick={this.addObj} value="add" />
                </div>
            </div>
        )
    }
});

var LinkList = React.createClass({
    render: function() {
        var onDelete = this.props.onDelete;
        var handleTag = this.props.handleTag;

        var links = this.props.data.map(function(link) {
            var tags = link.tags.map(function(tag) {
                return <Tag data={tag}
                            handleTag={handleTag} />;
            });

            data = link;
            data.tags = tags;

            return <Link data={data}
                         onDelete={onDelete}
                         />;
        });

        return (
            <div className="link-list">
                {links}
            </div>
        )
    }
});

var LinkImport = React.createClass({
    getInitialState: function() {
        return {edit: 'none'};
    },
    importLink: function(e) {
        e.preventDefault();
        var data = new FormData();
        data.append('file', this.refs.file.getDOMNode().files[0]);

        $.ajax({
            type: 'POST',
            enctype: 'multipart/form-data',
            url: '/import/',
            contentType: false,
            processData: false,
            data: data,
            headers: {'X-CSRFToken': $.cookie('csrftoken')},
            success: function(data) {}
        });
        return false;
    },

    toggleImporter: function(event) {
        var edit = 'none';

        if(this.state.edit == 'none') {
            edit = 'block';
        }

        this.setState({edit: edit});
    },

    render: function() {
        return (
            <div>
                <a href="#import" onClick={this.toggleImporter}>Import from Delicious</a>

                <form style={{display: this.state.edit}}>
                    <input ref="file" type="file" name="file" />
                    <a href="#import" onClick={this.importLink} className="btn btn-primary">Import</a>
                </form>
            </div>
        );
    }
});

var LinkSearch = React.createClass({
    onSearch: function() {
        var query = this.refs.query.getDOMNode().value.trim();
        this.props.handleSearch(query);
    },
    render: function() {
        return (
            <div>
                <input type="search" placeholder="Search" ref="query" />
                <input type="button" value="Search" onClick={this.onSearch}/>
            </div>
        );
    }
});

var LinkBox = React.createClass({
    handleAddLink: function(url) {
        link = {url: url};

        $.ajax({
            type: 'POST',
            url: this.props.url,
            data: link,
            headers: {'X-CSRFToken': $.cookie('csrftoken')},
            success: function(data) {
                var links = this.state.data;
                var newLinks = [data].concat(links);
                this.setState({data: newLinks});
            }.bind(this)
        });
    },
    deleteObj: function(data_id) {
        var links = this.state.data;
        var newlinks = links.filter(function(elem) {
            return elem.id != data_id;
        });

        this.setState({data: newlinks});

        $.ajax({
            type: 'DELETE',
            url: '/api/links/' + data_id + '/',
            success: function() {}.bind(this),
            headers: {'X-CSRFToken': $.cookie('csrftoken')}
        });
    },
    loadLinksFromServer: function(query) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            data: {query: query},
            success: function(data) {
              this.setState({data: data});
            }.bind(this)
        });
    },
    searchLinks: function(query) {
        this.loadLinksFromServer(query);
    },
    clickTag: function(tag) {
        this.searchLinks('#' + tag);
    },
    getInitialState: function() {
        return {data: []};
    },
    componentWillMount: function() {
        this.loadLinksFromServer();
    },
    render: function() {
        return (
            <div>
                <h3>Links</h3>
                <LinkImport />

                <LinkForm url={this.props.url} onSubmit={this.handleAddLink} />

                <LinkSearch handleSearch={this.searchLinks} />

                <LinkList data={this.state.data} onDelete={this.deleteObj}
                          handleTag={this.clickTag} />
            </div>
        )
    }
});

React.renderComponent(
  <LinkBox url={'/api/links/'}/>,
  document.getElementById('content')
);
