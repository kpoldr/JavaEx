package model;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Person {

    private Long id;

    @NonNull
    @Size(min = 1, max = 32)
    private String firstName;

    @NonNull
    @Size(min = 1, max = 32)
    private String lastName;

    @NonNull
    @Size(min = 11, max = 11)
    private String idCode;

    @Valid
    private EventParticipation[] eventParticipations;


}
