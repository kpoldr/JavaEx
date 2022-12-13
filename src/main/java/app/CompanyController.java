package app;

import dao.CompanyDao;
import model.Company;
import validation.ValidationError;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin
@RestController
public class CompanyController {
    private CompanyDao dao;

    public CompanyController(CompanyDao dao) {
        this.dao = dao;
    }

    @PostMapping("companies")
    public Company insertCompany(@RequestBody @Valid Company company)
    {
        return dao.insertCompany(company);
    }

    @PutMapping("companies/{id}")
    public ResponseEntity<ValidationError> updateCompany(@RequestBody @Valid Company company, @PathVariable Long id)
    {

        int response = dao.updateCompany(company, id);

        if (response == 409) {
            ValidationError error = new ValidationError("A company already has that register code", List.of(company.getRegisterCode()));

            return new ResponseEntity<>( error ,HttpStatus.CONFLICT);

        } else if (response == 400) {
            ValidationError error = new ValidationError("Bad request", new ArrayList<>());

            return new ResponseEntity<>( error ,HttpStatus.BAD_REQUEST);
        }

        return null;
    }

    @GetMapping("companies/{id}")
    public Company getById(@PathVariable Long id) {

        return dao.findCompanyId(id);
    }

    @GetMapping("companies")
    public List<Company> getCompanies() {
        return dao.findCompanies();
    }

    @DeleteMapping("companies/{id}")
    public void deletePost(@PathVariable Long id) {

        dao.deleteCompanyId(id);
    }

}
