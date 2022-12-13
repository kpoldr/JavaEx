package app;

import dao.PersonDao;
import model.Person;
import validation.ValidationError;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin
@RestController
public class PersonController {
    private PersonDao dao;

    public PersonController(PersonDao dao) {
        this.dao = dao;
    }

    @PostMapping("people")
    public Person insertPerson(@RequestBody @Valid Person person)
    {
        return dao.insertPerson(person);
    }

    @GetMapping("people/{id}")
    public Person getById(@PathVariable Long id) {

        return dao.findPersonId(id);
    }

    @PutMapping("people/{id}")
    public ResponseEntity<ValidationError> updatePerson(@RequestBody @Valid Person person, @PathVariable Long id) {

        int response = dao.updatePerson(person, id);

        if (response == 409) {
            ValidationError error = new ValidationError("A person already has that id code", List.of(person.getIdCode()));

            return new ResponseEntity<>( error , HttpStatus.CONFLICT);

        } else if (response == 400) {
            ValidationError error = new ValidationError("Bad request", new ArrayList<>());

            return new ResponseEntity<>( error ,HttpStatus.BAD_REQUEST);
        }

        return null;
    }

    @GetMapping("people")
    public List<Person> getPersons() {
        return dao.findPersons();
    }

    @DeleteMapping("people/{id}")
    public void deletePost(@PathVariable Long id) {

        dao.deletePersonId(id);
    }

}
