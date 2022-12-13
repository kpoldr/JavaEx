package model;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Company {

    private Long id;

    @NonNull
    @Size(min = 1, max = 50)
    private String name;

    @NonNull
    @Size(min = 8, max = 8)
    private String registerCode;

    @Valid
    private EventParticipation[] eventParticipations;


}
