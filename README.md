
# Formmy.js

Front form validation interface

## Usage

### HTML

```html
<form action="/post" id="my-form">
    <ul>
        <li>
            Name: <input type="text" name="name" data-validation="require; length(0, 100)">
            <span class="message" data-for="name"></span>
        </li>
        <li>
            Email: <input type="text" name="email" data-validation="require; email;">
            <span class="message" data-for="email"></span>
        </li>
        <li>
            Email (confirm): <input type="text" name="email_confirm" data-validation="require; equals(__email__);">
            <span class="message" data-for="email_confirm"></span>
        </li>
    </ul>
    <input type="submit">
</form>
```

- Set rule methods and arguments in `data-validation` attribute of each input element
- `[data-for="*"].message` is container for error message (this can be ommitted)
- `__[name]__` in argument is replaced with its value


### CSS

- `valid` or `invalid` class is applied to input element when validated.
- `.message` element is switched with `message-empty`, `message-error`, `message-valid` classes for its state.
- These class names are configurable.


### JavaScript

```javascript
$("#my-form").formmy({}, {
    "name": {
        "require": "Please input your name.",
        "length": "Please input within 100 characters."
    },
    "email": {
        "require": "Please input your email address.",
        "email": "This email is not valid"
    },
    "email_confirm": {
        "require": "Please input your email address again.",
        "equals": "Email addresses are not match."
    }
})
.on("formmySubmit", function(){
    // Submitted and all values are valid, it's fired

    // Get the instance with $.fn.getFormmy()
    var instance = $(this).getFormmy();

    // Serialize values
    var values = instance.serialize();

    // Then, do something with the values
});
```

- 1st argument is options
- 2nd argument is error messages

## More features

### Request

Use `Formmy.request` or `Formmy.ajax` to send request with user input.

```
$("#my-form").formmy({...}, {...})
.on("formmySubmit", function(){
    $(this).getFormmy().ajax().done(function(){
        alert("Thank you !");
    });
});
```

- **Formmy.request** ... Clone the form element and request it
- **Formmy.ajax** ... Send Ajax request with serialized value
