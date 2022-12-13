package dao;


import model.Company;
import model.EventParticipation;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class CompanyDao {

    private JdbcTemplate template;

    private static final String EVENT_PARTICIPATION_ID = "event_participation_id";
    private static final String COMPANY_ID = "company_id";
    private static final String NAME = "name";
    private static final String REGISTER_CODE = "register_code";


    public CompanyDao(JdbcTemplate template) {
        this.template = template;
    }

    public List<Company> findCompanies() {
        var handler = new CompanyHandler();
        String sql = "select * from company";
        template.query(sql, handler);

        return handler.getCompanies();
    }

    public Company findCompanyId(Long id) {
        var handler = new CompanyHandler();

        String sql = "select * from company WHERE company.company_id = ?";

        template.query(sql, handler, id);

        return handler.getCompanies().get(0);
    }

    public int updateCompany(Company company, Long id) {

        EventParticipation[] participations = company.getEventParticipations();

        if (participations.length == 0) {
            return 400 ;
        }

        EventParticipation participation = participations[0];

        // Bad solution, but couldn't get "RETURNING" to work
        String sql = "SELECT COUNT(*) FROM event_participation ep LEFT JOIN company c ON c.company_id = ep.company_id" +
                " WHERE c.register_code = ? AND c.company_id != ? AND ep.event_id = ? ";

        int count = template.queryForObject(sql, Integer.class, company.getRegisterCode(), company.getId(), id);

        if (count > 0 ) {
            return 409;
        }

        sql = "UPDATE company SET name = ?, register_code = ? WHERE company_id = ?";

        template.update(sql, company.getName(), company.getRegisterCode(), company.getId());

        sql = "UPDATE event_participation SET num_of_participants = ?, payment_type = ?, extra_info = ? WHERE event_id = ? AND company_id = ?";

        template.update(sql, participation.getNumOfParticipants(), participation.getPaymentType(), participation.getExtraInfo(), id, company.getId());

        return 200;
    }

    public Company insertCompany(Company company) {

        var companyData = new BeanPropertySqlParameterSource(company);

        EventParticipation[] participations = company.getEventParticipations();

        String checkCompanySql = "select company_id from company WHERE company.register_code = ?";

        Long companyId;

        try {
            companyId = template.queryForObject(checkCompanySql, Long.class, company.getRegisterCode());
        } catch (EmptyResultDataAccessException e) {
            companyId = null;
        }

        String checkParticipationSql = "select * from event_participation WHERE event_participation.company_id = ?";

        List<EventParticipation> participationsFromDb;

        try {
            participationsFromDb = template.query(checkParticipationSql, new BeanPropertyRowMapper<>(EventParticipation.class), companyId);
        } catch (EmptyResultDataAccessException e) {
            participationsFromDb = null;
        }


        if (participationsFromDb != null && participations != null) {
            for (EventParticipation eventPartDb : participationsFromDb) {

                for (EventParticipation eventPart : participations) {

                    if (eventPart.getEventId().equals(eventPartDb.getEventId())) {

                        //add error
                        return company;
                    }
                }
            }
        }

        if (companyId == null) {

            Number number = new SimpleJdbcInsert(template)
                    .withTableName("company")
                    .usingGeneratedKeyColumns(COMPANY_ID)
                    .executeAndReturnKey(companyData);

            companyId = number.longValue();

        }

        company.setId(companyId);

        if (participations != null && participations.length > 0) {

            EventParticipation participation = participations[0];

            var participationData = new BeanPropertySqlParameterSource(participation);

            participation.setCompanyId(companyId);

            Number participationNumber = new SimpleJdbcInsert(template)
                    .withTableName("event_participation")
                    .usingGeneratedKeyColumns(EVENT_PARTICIPATION_ID)
                    .executeAndReturnKey(participationData);

            participation.setId(participationNumber.longValue());

            company.setEventParticipations(new EventParticipation[] {participation});

        }
        return company;
    }


    public void deleteCompanyId(Long id) {

        String sql = "DELETE from company where company_id = ?";

        template.update(sql, id);

    }

    private class CompanyHandler implements RowCallbackHandler {
        private List<Company> companies = new ArrayList<>();

        public void processRow(ResultSet rs) throws SQLException {

            while (!rs.isAfterLast()) {

                companies.add(new Company(rs.getLong(COMPANY_ID),
                        rs.getString(NAME),
                        rs.getString(REGISTER_CODE),
                        null));

                rs.next();
            }

        }

        public List<Company> getCompanies() {
            return companies;
        }

    }

}
