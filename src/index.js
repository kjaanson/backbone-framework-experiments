
import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import Store from 'backbone.localstorage';

import catapp from './cats';

var app = {};

app.Todo = Backbone.Model.extend({
    defaults: {
        title:'',
        completed: false
    },
    toggle: function() {
        this.save({completed: !this.get('completed')});
    }
});

app.TodoList = Backbone.Collection.extend({
    model:app.Todo,
    localStorage: new Store("backbone-todo"),
    completed: function() {
        return this.filter(function(todo) {
            return todo.get('completed');
        });
    },
    remaining: function() {
        return this.without.apply( this, this.completed());
    }
});

app.todoList = new app.TodoList();

app.TodoView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-template').html()),
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this; //chainimiseks
    },
    initialize: function() {
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this); //remove is Backbone-i convenience function for removing view from the DOM
    },
    events: {
        'dblclick label' : 'edit',
        'keypress .edit' : 'updateOnEnter',
        'blur .edit' : 'close',
        'click .toggle' : 'toggleCompleted',
        'click .destroy' : 'destroy',
    },
    edit: function() {
        this.$el.addClass('editing');
        this.input.focus();
    },
    close: function() {
        var value = this.input.val().trim();
        if(value) {
            this.model.save({title: value});
        }
        this.$el.removeClass('editing');
    },
    updateOnEnter: function(e) {
        if(e.which == 13) {
            this.close();
        }
    },
    toggleCompleted: function() {
        this.model.toggle();
    },
    destroy: function() {
        this.model.destroy();
    },
});

app.AppView = Backbone.View.extend({
    el: '#todoapp',
    initialize: function() {
        this.input = this.$('#new-todo');
        //uute elementide lisamisel redderda addOne-iga
        app.todoList.on('add',this.addOne, this);
        app.todoList.on('reset',this.addAll, this);
        app.todoList.fetch(); // laeb listi localStorage-st
    },
    events:{
        'keypress #new-todo':'createTodoOnEnter'
    },
    createTodoOnEnter: function(e){
        if (e.which !== 13 || !this.input.val().trim() ) {
            //kui ei ole enter nupp või on tühi input
            return;
        }
        app.todoList.create(this.newAttributes());
        this.input.val(''); //input tühjaks
    },
    addOne: function(todo) {
        var view = new app.TodoView({model: todo});
        $('#todo-list').append(view.render().el);
    },
    addAll: function() {
        this.$('#todo-list').html('');

        switch(window.filter){
            case 'pending':
                _.each(app.todoList.remaining(), this.addOne);
                break;
            case 'completed':
                _.each(app.todoList.completed(), this.addOne);
                break;
            default:
                app.todoList.each(this.addOne, this);
                break;
        }
    },
    newAttributes: function() {
        return {
            title: this.input.val().trim(),
            completed: false
        }
    }
});

app.Router = Backbone.Router.extend({
    routes: {
        '*filter' : 'setFilter'
    },
    setFilter: function(params) {
        if(params) {
            window.filter = params.trim() || '';
        } else {
            window.filter = '';
        }
        app.todoList.trigger('reset');
    }
});

app.router = new app.Router();
Backbone.history.start();
app.appView = new app.AppView();
