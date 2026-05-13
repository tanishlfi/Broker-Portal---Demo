import { Grid } from "@mui/material";
import FeatureCard from "./FeatureCard";

const FeatureCardGrid = ({ cards, accessToken, brokerId }) => (
    <Grid container>
        {cards.map(({ title, link, Icon, external }, index) => (
            <Grid item xs={4} md={4} lg={3} xl={2} key={index}>
                <FeatureCard
                    title={title}
                    link={link}
                    Icon={Icon}
                    accessToken={external ? accessToken : undefined}
                    brokerId={external ? brokerId : undefined}
                />
            </Grid>
        ))}
    </Grid>
);

export default FeatureCardGrid;